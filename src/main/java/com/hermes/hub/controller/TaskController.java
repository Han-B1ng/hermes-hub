package com.hermes.hub.controller;

import com.hermes.hub.entity.Task;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.entity.TraceResult;
import com.hermes.hub.service.ReplayEngine;
import com.hermes.hub.service.TraceEngine;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final com.hermes.hub.mapper.TaskMapper taskMapper;
    private final TraceEngine traceEngine;
    private final ReplayEngine replayEngine;

    public TaskController(com.hermes.hub.mapper.TaskMapper taskMapper,
                          TraceEngine traceEngine, ReplayEngine replayEngine) {
        this.taskMapper = taskMapper;
        this.traceEngine = traceEngine;
        this.replayEngine = replayEngine;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskMapper.selectAll();
    }

    @GetMapping("/{id}")
    public Task getTask(@PathVariable String id) {
        return taskMapper.selectById(id);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setId(UUID.randomUUID().toString());
        task.setStatus(com.hermes.hub.entity.TaskStatus.PENDING);
        task.setCreatedAt(LocalDateTime.now());
        taskMapper.insert(task);
        return task;
    }

    @GetMapping("/{id}/trace")
    public TraceResult getTrace(@PathVariable String id) {
        return traceEngine.buildTrace(id);
    }

    @GetMapping("/{id}/replay")
    public List<TaskEvent> getReplayEvents(@PathVariable String id) {
        return replayEngine.getReplayEvents(id);
    }

    @GetMapping("/{id}/replay/range")
    public List<TaskEvent> getReplayRange(@PathVariable String id,
                                          @RequestParam long from,
                                          @RequestParam long to) {
        return replayEngine.getReplayRange(id, from, to);
    }
}
