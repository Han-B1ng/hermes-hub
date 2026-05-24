package com.hermes.hub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.mapper.TaskEventMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final TaskEventMapper taskEventMapper;
    private final NatsPublisher natsPublisher;
    private final ObjectMapper objectMapper;

    public EventService(TaskEventMapper taskEventMapper, NatsPublisher natsPublisher, ObjectMapper objectMapper) {
        this.taskEventMapper = taskEventMapper;
        this.natsPublisher = natsPublisher;
        this.objectMapper = objectMapper;
    }

    public TaskEvent createEvent(TaskEvent event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setSeq(System.currentTimeMillis());
        taskEventMapper.insert(event);
        try {
            String json = objectMapper.writeValueAsString(event);
            natsPublisher.publish("hermes.task." + event.getTaskId(), json);
        } catch (Exception ignored) {
            // NATS publish failure should not break the request
        }
        return event;
    }

    public List<TaskEvent> getEventsByTaskId(String taskId) {
        return taskEventMapper.selectByTaskId(taskId);
    }

    public List<TaskEvent> getLatestEvents(int limit) {
        return taskEventMapper.selectLatest(limit);
    }

    public List<TaskEvent> getEventsBySeqRange(long from, long to) {
        return taskEventMapper.selectBySeqRange(from, to);
    }
}
