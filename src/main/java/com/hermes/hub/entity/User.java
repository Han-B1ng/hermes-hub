package com.hermes.hub.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String username;
    private String passwordHash;
    private String role = "user";
    private LocalDateTime createdAt = LocalDateTime.now();
}
