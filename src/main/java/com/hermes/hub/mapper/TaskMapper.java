package com.hermes.hub.mapper;

import com.hermes.hub.entity.Task;
import com.hermes.hub.entity.TaskStatus;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TaskMapper {

    void insert(Task task);

    Task selectById(String id);

    List<Task> selectAll();

    void updateStatus(String id, TaskStatus status);

    void update(Task task);

    List<Task> selectByAgentId(String agentId);
}
