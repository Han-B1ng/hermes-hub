package com.hermes.hub.mapper;

import com.hermes.hub.entity.Agent;
import com.hermes.hub.entity.AgentStatus;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AgentMapper {

    void insert(Agent agent);

    Agent selectById(String id);

    List<Agent> selectAll();

    void updateStatus(String id, AgentStatus status);

    void updateCurrentTask(String id, String taskId);
}
