package com.hermes.hub.controller;

import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public TaskEvent createEvent(@RequestBody TaskEvent event) {
        return eventService.createEvent(event);
    }

    @GetMapping("/task/{taskId}")
    public List<TaskEvent> getEventsByTaskId(@PathVariable String taskId) {
        return eventService.getEventsByTaskId(taskId);
    }

    @GetMapping("/latest")
    public List<TaskEvent> getLatestEvents(@RequestParam(defaultValue = "20") int limit) {
        return eventService.getLatestEvents(limit);
    }
}
