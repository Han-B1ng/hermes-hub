package com.hermes.hub.controller;

import com.hermes.hub.entity.Agent;
import com.hermes.hub.entity.AgentStatus;
import com.hermes.hub.service.AgentRegistry;
import com.hermes.hub.service.StatusManager;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentRegistry agentRegistry;
    private final StatusManager statusManager;

    public AgentController(AgentRegistry agentRegistry, StatusManager statusManager) {
        this.agentRegistry = agentRegistry;
        this.statusManager = statusManager;
    }

    @GetMapping
    public List<Agent> getAllAgents() {
        return agentRegistry.getAllAgents();
    }

    @GetMapping("/{id}")
    public Agent getAgent(@PathVariable String id) {
        return agentRegistry.getAgent(id);
    }

    @PostMapping
    public Agent registerAgent(@RequestBody Agent agent) {
        return agentRegistry.registerAgent(agent);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(@PathVariable String id, @RequestBody Map<String, AgentStatus> body) {
        statusManager.transition(id, body.get("status"));
    }
}
