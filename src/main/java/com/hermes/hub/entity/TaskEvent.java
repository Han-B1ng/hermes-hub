package com.hermes.hub.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskEvent {
    private Long id;
    private String taskId;
    private String agentId;
    private EventType eventType;
    private String eventData;
    private Long seq;
    private LocalDateTime createdAt;
}
