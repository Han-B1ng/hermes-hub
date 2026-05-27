package com.hermes.hub.config;

import com.hermes.hub.service.EventService;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.entity.Task;
import com.hermes.hub.entity.TaskStatus;
import com.hermes.hub.entity.EventType;
import com.hermes.hub.mapper.TaskMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);
    private final Map<String, ChatSession> sessions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    private final EventService eventService;
    private final TaskMapper taskMapper;
    private final ObjectMapper objectMapper;

    public ChatWebSocketHandler(EventService eventService, TaskMapper taskMapper, ObjectMapper objectMapper) {
        this.eventService = eventService;
        this.taskMapper = taskMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String agentId = extractAgentId(session);
        log.info("Chat WS connected: agent={}, session={}", agentId, session.getId());
        ChatSession cs = new ChatSession(session, agentId);
        sessions.put(session.getId(), cs);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatSession cs = sessions.get(session.getId());
        if (cs == null) return;

        Map<String, Object> msg;
        try {
            msg = objectMapper.readValue(message.getPayload(), Map.class);
        } catch (Exception e) {
            return;
        }

        String type = (String) msg.get("type");
        String content = (String) msg.get("content");

        if ("message".equals(type) && content != null && !content.isBlank()) {
            cs.startTask(content);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        ChatSession cs = sessions.remove(session.getId());
        if (cs != null) cs.stop();
        log.info("Chat WS disconnected: session={}", session.getId());
    }

    private String extractAgentId(WebSocketSession session) {
        String path = session.getUri() != null ? session.getUri().getPath() : "";
        // /ws/chat/{agentId}
        String[] parts = path.split("/");
        return parts.length >= 4 ? parts[3] : "agent-001";
    }

    private class ChatSession {
        private final WebSocketSession session;
        private final String agentId;
        private ScheduledFuture<?> pollFuture;
        private String taskId;
        private long lastSeq = 0;
        private final AtomicBoolean running = new AtomicBoolean(true);

        ChatSession(WebSocketSession session, String agentId) {
            this.session = session;
            this.agentId = agentId;
        }

        void startTask(String userMessage) {
            taskId = "chat-" + UUID.randomUUID().toString().substring(0, 8);

            // Create task
            Task task = new Task();
            task.setId(taskId);
            task.setAgentId(agentId);
            task.setTitle(userMessage.length() > 60 ? userMessage.substring(0, 57) + "..." : userMessage);
            task.setStatus(TaskStatus.RUNNING);
            task.setStartedAt(java.time.LocalDateTime.now());
            task.setCreatedAt(java.time.LocalDateTime.now());
            taskMapper.insert(task);

            // Create TASK_CREATED event
            TaskEvent created = new TaskEvent();
            created.setTaskId(taskId);
            created.setAgentId(agentId);
            created.setEventType(EventType.TASK_CREATED);
            created.setEventData(userMessage);
            eventService.createEvent(created);

            // Create TASK_STARTED event
            TaskEvent started = new TaskEvent();
            started.setTaskId(taskId);
            started.setAgentId(agentId);
            started.setEventType(EventType.TASK_STARTED);
            started.setEventData("Agent processing request");
            eventService.createEvent(started);

            // Start polling for adapter events
            lastSeq = System.currentTimeMillis();
            pollFuture = scheduler.scheduleWithFixedDelay(this::pollEvents, 200, 500, TimeUnit.MILLISECONDS);

            // Simulate agent response after 1 second
            scheduler.schedule(this::simulateResponse, 1, TimeUnit.SECONDS);
        }

        private void simulateResponse() {
            if (!running.get()) return;
            try {
                // Thinking
                sendEvent("thinking", Map.of("content", "Let me analyze the request... Checking available tools and agent status for " + agentId + "..."));
                Thread.sleep(800);

                // Tool start
                sendEvent("tool_start", Map.of("tool", "terminal", "args", "ls -la /opt/hermes/"));
                Thread.sleep(600);

                // Tool output
                sendEvent("tool_output", Map.of("content", "total 32\ndrwxr-xr-x  8 hermes hermes 4096 May 24 22:00 .\ndrwxr-xr-x  3 root   root   4096 May 20 10:00 ..\n-rw-r--r--  1 hermes hermes 1024 May 24 21:00 config.yaml\n-rw-r--r--  1 hermes hermes  256 May 24 20:00 agents.json\ndrwxr-xr-x  2 hermes hermes 4096 May 23 15:00 logs/"));
                Thread.sleep(400);

                // Tool end
                sendEvent("tool_end", Map.of("tool", "terminal", "duration_ms", 420, "status", "success"));
                Thread.sleep(300);

                // Tool start 2
                sendEvent("tool_start", Map.of("tool", "nats_pub", "args", "subject: dk.cmd.exec, payload: echo ok"));
                Thread.sleep(500);

                // Tool end 2
                sendEvent("tool_end", Map.of("tool", "nats_pub", "duration_ms", 1500, "status", "success"));
                Thread.sleep(200);

                // Assistant response
                sendEvent("assistant", Map.of("content", "I've checked the agent status and published a test message via NATS. Here's what I found:\n\n1. **Agent " + agentId + "** is online and responsive\n2. NATS connection is healthy (RTT ~5ms)\n3. Config files are present in /opt/hermes/\n\nEverything looks good! Is there anything specific you'd like me to check?"));
                Thread.sleep(200);

                // Token usage
                sendEvent("token", Map.of("input", 450, "output", 280, "cost", 0.0012));

                // Mark task complete
                if (taskId != null) {
                    Task task = taskMapper.selectById(taskId);
                    if (task != null) {
                        task.setStatus(TaskStatus.COMPLETED);
                        task.setEndedAt(java.time.LocalDateTime.now());
                        task.setDurationMs(System.currentTimeMillis() - task.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
                        taskMapper.update(task);
                    }

                    TaskEvent completed = new TaskEvent();
                    completed.setTaskId(taskId);
                    completed.setAgentId(agentId);
                    completed.setEventType(EventType.TASK_COMPLETED);
                    completed.setEventData("Chat task completed");
                    eventService.createEvent(completed);
                }

                sendEvent("done", Map.of());

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        private void pollEvents() {
            if (!running.get() || taskId == null) return;
            // We don't need to poll since simulated events are pushed directly
            // In production, this would query for new events from the adapter
        }

        private void sendEvent(String type, Object data) {
            try {
                Map<String, Object> event = new java.util.LinkedHashMap<>();
                event.put("type", type);
                if (data instanceof Map) {
                    event.putAll((Map<String, Object>) data);
                }
                String json = objectMapper.writeValueAsString(event);
                session.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                log.warn("Failed to send WS message: {}", e.getMessage());
            }
        }

        void stop() {
            running.set(false);
            if (pollFuture != null) pollFuture.cancel(false);
        }
    }
}
