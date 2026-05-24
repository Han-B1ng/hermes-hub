package com.hermes.hub.service;

import com.hermes.hub.entity.*;
import com.hermes.hub.mapper.TaskEventMapper;
import com.hermes.hub.mapper.TaskMapper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TraceEngine {

    private final TaskMapper taskMapper;
    private final TaskEventMapper taskEventMapper;

    public TraceEngine(TaskMapper taskMapper, TaskEventMapper taskEventMapper) {
        this.taskMapper = taskMapper;
        this.taskEventMapper = taskEventMapper;
    }

    public TraceResult buildTrace(String taskId) {
        Task task = taskMapper.selectById(taskId);
        List<TaskEvent> events = taskEventMapper.selectByTaskId(taskId);

        List<TraceNode> nodes = new ArrayList<>();
        Map<Long, TraceNode> openToolNodes = new LinkedHashMap<>();

        for (TaskEvent event : events) {
            if (event.getEventType() == EventType.TOOL_START) {
                TraceNode node = new TraceNode();
                node.setEventType(EventType.TOOL_START);
                node.setToolName(extractToolName(event.getEventData()));
                node.setTimestamp(event.getCreatedAt());
                node.setChildren(new ArrayList<>());
                openToolNodes.put(event.getSeq(), node);
                nodes.add(node);
            } else if (event.getEventType() == EventType.TOOL_END) {
                Optional<Map.Entry<Long, TraceNode>> match = openToolNodes.entrySet().stream()
                        .reduce((first, second) -> second);
                if (match.isPresent()) {
                    TraceNode node = match.get().getValue();
                    node.setEventType(EventType.TOOL_END);
                    if (node.getTimestamp() != null && event.getCreatedAt() != null) {
                        node.setDurationMs(Duration.between(node.getTimestamp(), event.getCreatedAt()).toMillis());
                    }
                    node.setTimestamp(event.getCreatedAt());
                    openToolNodes.remove(match.get().getKey());
                }
            } else {
                TraceNode node = new TraceNode();
                node.setEventType(event.getEventType());
                node.setTimestamp(event.getCreatedAt());
                node.setChildren(new ArrayList<>());
                nodes.add(node);
            }
        }

        TraceResult result = new TraceResult();
        result.setTask(task);
        result.setNodes(nodes);
        return result;
    }

    private String extractToolName(String eventData) {
        if (eventData == null) return null;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var tree = mapper.readTree(eventData);
            if (tree.has("toolName")) return tree.get("toolName").asText();
            if (tree.has("tool")) return tree.get("tool").asText();
        } catch (Exception ignored) {
        }
        return eventData;
    }
}
