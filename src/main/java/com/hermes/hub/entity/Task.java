package com.hermes.hub.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Task {
    private String id;
    private String agentId;
    private String title;
    private TaskStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long durationMs;
    private LocalDateTime createdAt;
}
