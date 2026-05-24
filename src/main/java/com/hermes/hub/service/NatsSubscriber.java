package com.hermes.hub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.mapper.TaskEventMapper;
import io.nats.client.Connection;
import io.nats.client.Dispatcher;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
public class NatsSubscriber {

    private final Connection natsConnection;
    private final TaskEventMapper taskEventMapper;
    private final ObjectMapper objectMapper;

    public NatsSubscriber(Connection natsConnection, TaskEventMapper taskEventMapper, ObjectMapper objectMapper) {
        this.natsConnection = natsConnection;
        this.taskEventMapper = taskEventMapper;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void subscribe() {
        Dispatcher dispatcher = natsConnection.createDispatcher(msg -> {
            try {
                TaskEvent event = objectMapper.readValue(msg.getData(), TaskEvent.class);
                if (event.getCreatedAt() == null) {
                    event.setCreatedAt(LocalDateTime.now());
                }
                taskEventMapper.insert(event);
            } catch (Exception e) {
                log.error("Failed to process NATS message on subject {}: {}", msg.getSubject(), e.getMessage());
            }
        });
        dispatcher.subscribe("hermes.>");
    }
}
