package com.hermes.hub.service;

import com.hermes.hub.entity.Agent;
import com.hermes.hub.entity.AgentStatus;
import com.hermes.hub.entity.EventType;
import com.hermes.hub.entity.TaskEvent;
import com.hermes.hub.mapper.AgentMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AgentRegistry {

    private final AgentMapper agentMapper;
    private final NatsPublisher natsPublisher;
    private final EventService eventService;

    public AgentRegistry(AgentMapper agentMapper, NatsPublisher natsPublisher, EventService eventService) {
        this.agentMapper = agentMapper;
        this.natsPublisher = natsPublisher;
        this.eventService = eventService;
    }

    public Agent registerAgent(Agent agent) {
        agent.setStatus(AgentStatus.ONLINE);
        agent.setCreatedAt(LocalDateTime.now());
        agent.setUpdatedAt(LocalDateTime.now());
        agentMapper.insert(agent);

        TaskEvent event = new TaskEvent();
        event.setAgentId(agent.getId());
        event.setEventType(EventType.AGENT_ONLINE);
        eventService.createEvent(event);

        return agent;
    }

    public Agent getAgent(String id) {
        return agentMapper.selectById(id);
    }

    public List<Agent> getAllAgents() {
        return agentMapper.selectAll();
    }

    public void updateAgentStatus(String id, AgentStatus status) {
        agentMapper.updateStatus(id, status);
    }

    public void assignTask(String agentId, String taskId) {
        agentMapper.updateCurrentTask(agentId, taskId);
    }
}
