package com.hermes.hub.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Agent {
    private String id;
    private String name;
    private String type;
    private com.hermes.hub.entity.AgentStatus status;
    private String currentTaskId;
    private LocalDateTime startedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
