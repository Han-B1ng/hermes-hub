package com.hermes.hub.service;

import com.hermes.hub.entity.Agent;
import com.hermes.hub.entity.AgentStatus;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
public class StatusManager {

    private static final Map<AgentStatus, Set<AgentStatus>> TRANSITIONS = new EnumMap<>(AgentStatus.class);

    static {
        TRANSITIONS.put(AgentStatus.OFFLINE, EnumSet.of(AgentStatus.ONLINE));
        TRANSITIONS.put(AgentStatus.ONLINE, EnumSet.of(AgentStatus.IDLE, AgentStatus.OFFLINE, AgentStatus.RUNNING));
        TRANSITIONS.put(AgentStatus.IDLE, EnumSet.of(AgentStatus.RUNNING, AgentStatus.OFFLINE));
        TRANSITIONS.put(AgentStatus.RUNNING, EnumSet.of(AgentStatus.IDLE, AgentStatus.ERROR));
        TRANSITIONS.put(AgentStatus.ERROR, EnumSet.of(AgentStatus.IDLE, AgentStatus.OFFLINE));
    }

    private final AgentRegistry agentRegistry;

    public StatusManager(AgentRegistry agentRegistry) {
        this.agentRegistry = agentRegistry;
    }

    public boolean validateTransition(AgentStatus from, AgentStatus to) {
        Set<AgentStatus> allowed = TRANSITIONS.get(from);
        return allowed != null && allowed.contains(to);
    }

    public void transition(String agentId, AgentStatus target) {
        Agent agent = agentRegistry.getAgent(agentId);
        if (agent == null) {
            throw new IllegalStateException("Agent not found: " + agentId);
        }
        if (!validateTransition(agent.getStatus(), target)) {
            throw new IllegalStateException(
                    "Illegal transition: " + agent.getStatus() + " -> " + target);
        }
        agentRegistry.updateAgentStatus(agentId, target);
    }
}
