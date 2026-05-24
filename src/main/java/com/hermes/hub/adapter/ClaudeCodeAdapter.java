package com.hermes.hub.adapter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hermes.hub.entity.EventType;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.service.EventService;
import com.hermes.hub.service.NatsPublisher;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class ClaudeCodeAdapter implements AgentAdapter {

    private static final Logger log = LoggerFactory.getLogger(ClaudeCodeAdapter.class);

    private final EventService eventService;
    private final NatsPublisher natsPublisher;
    private final ObjectMapper objectMapper;

    private Process process;
    private PrintWriter stdin;
    private Thread readerThread;
    private final ExecutorService executor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "claude-code-stdout-reader");
        t.setDaemon(true);
        return t;
    });

    public ClaudeCodeAdapter(EventService eventService, NatsPublisher natsPublisher, ObjectMapper objectMapper) {
        this.eventService = eventService;
        this.natsPublisher = natsPublisher;
        this.objectMapper = objectMapper;
    }

    @Override
    public String type() {
        return "claude-code";
    }

    @Override
    public void connect(Map<String, String> config) {
        String cliCommand = config.getOrDefault("cliCommand", "claude");
        try {
            ProcessBuilder pb = new ProcessBuilder(cliCommand, "--output-format", "stream-json");
            pb.redirectErrorStream(true);
            process = pb.start();
            stdin = new PrintWriter(process.getOutputStream(), true);

            readerThread = new Thread(this::readOutput, "claude-code-output-reader");
            readerThread.setDaemon(true);
            readerThread.start();

            log.info("Claude Code subprocess started with command: {}", cliCommand);
        } catch (Exception e) {
            log.error("Failed to start Claude Code subprocess", e);
            throw new RuntimeException("Failed to start Claude Code subprocess", e);
        }
    }

    @Override
    public void disconnect() {
        try {
            if (stdin != null) {
                stdin.close();
            }
            if (process != null) {
                process.destroy();
            }
            if (readerThread != null) {
                readerThread.interrupt();
            }
        } catch (Exception e) {
            log.error("Error disconnecting Claude Code subprocess", e);
        } finally {
            process = null;
            stdin = null;
            readerThread = null;
        }
    }

    @Override
    public void sendTask(String taskId, String instruction) {
        if (stdin == null) {
            throw new IllegalStateException("Adapter not connected");
        }
        try {
            String json = objectMapper.writeValueAsString(
                    Map.of("taskId", taskId, "instruction", instruction));
            stdin.println(json);
        } catch (Exception e) {
            log.error("Failed to send task to Claude Code subprocess", e);
        }
    }

    @Override
    public void onEvent(TaskEvent event) {
        eventService.createEvent(event);
    }

    private void readOutput() {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                parseAndEmit(line);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Error reading Claude Code subprocess output", e);
        }
    }

    private void parseAndEmit(String line) {
        String lower = line.toLowerCase();
        EventType type;

        if (lower.contains("[think]") || lower.contains("thinking")) {
            type = EventType.AGENT_RUNNING;
        } else if (lower.contains("tool_call")) {
            type = EventType.TOOL_START;
        } else if (lower.contains("tool_result")) {
            type = EventType.TOOL_END;
        } else if (lower.contains("error")) {
            type = EventType.ERROR;
        } else if (lower.contains("task completed")) {
            type = EventType.TASK_COMPLETED;
        } else {
            return;
        }

        TaskEvent event = new TaskEvent();
        event.setEventType(type);
        event.setEventData(line);
        event.setAgentId(type());
        onEvent(event);
    }

    @PreDestroy
    void shutdown() {
        disconnect();
        executor.shutdownNow();
    }
}
