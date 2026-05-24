package com.hermes.hub.service;

import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.mapper.TaskEventMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReplayEngine {

    private final TaskEventMapper taskEventMapper;

    public ReplayEngine(TaskEventMapper taskEventMapper) {
        this.taskEventMapper = taskEventMapper;
    }

    public List<TaskEvent> getReplayEvents(String taskId) {
        return taskEventMapper.selectByTaskId(taskId);
    }

    public List<TaskEvent> getReplayRange(String taskId, long fromSeq, long toSeq) {
        return taskEventMapper.selectBySeqRange(fromSeq, toSeq);
    }
}
