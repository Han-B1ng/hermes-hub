package com.hermes.hub.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TraceNode {
    private EventType eventType;
    private String toolName;
    private Long durationMs;
    private LocalDateTime timestamp;
    private List<TraceNode> children;
}
