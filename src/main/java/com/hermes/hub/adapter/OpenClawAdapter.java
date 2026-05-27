package com.hermes.hub.adapter;

import com.hermes.hub.entity.EventType;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.service.EventService;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Map;

@Component
public class OpenClawAdapter implements AgentAdapter {

    private static final Logger log = LoggerFactory.getLogger(OpenClawAdapter.class);

    private final EventService eventService;

    private Session session;
    private ChannelExec tailChannel;
    private Thread readerThread;

    public OpenClawAdapter(EventService eventService) {
        this.eventService = eventService;
    }

    @Override
    public String type() {
        return "openclaw";
    }

    @Override
    public void connect(Map<String, String> config) {
        String host = config.get("host");
        int port = Integer.parseInt(config.getOrDefault("port", "22"));
        String user = config.get("user");
        String password = config.get("password");
        String logPath = config.get("logPath");

        try {
            JSch jsch = new JSch();
            session = jsch.getSession(user, host, port);
            session.setPassword(password);
            session.setConfig("StrictHostKeyChecking", "no");
            session.connect();

            tailChannel = (ChannelExec) session.openChannel("exec");
            tailChannel.setCommand("tail -f " + logPath);
            InputStream in = tailChannel.getInputStream();
            tailChannel.connect();

            readerThread = new Thread(() -> readTailOutput(in), "openclaw-log-reader");
            readerThread.setDaemon(true);
            readerThread.start();

            log.info("Connected to OpenClaw at {}:{} via SSH, tailing {}", host, port, logPath);
        } catch (Exception e) {
            log.error("Failed to connect to OpenClaw at {}:{}", host, port, e);
            throw new RuntimeException("Failed to connect to OpenClaw", e);
        }
    }

    @Override
    public void disconnect() {
        try {
            if (readerThread != null) {
                readerThread.interrupt();
            }
            if (tailChannel != null) {
                tailChannel.disconnect();
            }
            if (session != null) {
                session.disconnect();
            }
        } catch (Exception e) {
            log.error("Error disconnecting from OpenClaw", e);
        } finally {
            readerThread = null;
            tailChannel = null;
            session = null;
        }
    }

    @Override
    public void sendTask(String taskId, String instruction) {
        if (session == null || !session.isConnected()) {
            throw new IllegalStateException("Adapter not connected");
        }
        try {
            ChannelExec exec = (ChannelExec) session.openChannel("exec");
            exec.setCommand(instruction);
            exec.connect();
            exec.disconnect();
        } catch (Exception e) {
            log.error("Failed to send task {} to OpenClaw", taskId, e);
        }
    }

    @Override
    public void onEvent(TaskEvent event) {
        eventService.createEvent(event);
    }

    private void readTailOutput(InputStream in) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(in))) {
            String line;
            while ((line = reader.readLine()) != null) {
                parseAndEmit(line);
            }
        } catch (Exception e) {
            log.error("Error reading OpenClaw log output", e);
        }
    }

    private void parseAndEmit(String line) {
        String lower = line.toLowerCase();
        EventType type;

        if (lower.contains("started") || lower.contains("begin")) {
            type = EventType.TASK_STARTED;
        } else if (lower.contains("completed") || lower.contains("success")) {
            type = EventType.TASK_COMPLETED;
        } else if (lower.contains("error") || lower.contains("failed")) {
            type = EventType.ERROR;
        } else if (lower.contains("tool")) {
            type = EventType.TOOL_START;
        } else {
            return;
        }

        try {
            TaskEvent event = new TaskEvent();
            event.setEventType(type);
            event.setEventData(line);
            event.setAgentId(type());
            onEvent(event);
        } catch (Exception e) {
            log.error("Failed to emit event from log line: {}", line, e);
        }
    }

    @PreDestroy
    void shutdown() {
        disconnect();
    }
}
