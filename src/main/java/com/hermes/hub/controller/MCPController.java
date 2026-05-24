package com.hermes.hub.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mcp")
public class MCPController {

    public record MCPServerStatus(String name, String status, int responseTime, double errorRate, int requestCount) {}

    @GetMapping
    public List<MCPServerStatus> getServerStatuses() {
        return List.of(
            new MCPServerStatus("Filesystem", "online", 12, 0.1, 1523),
            new MCPServerStatus("Git", "online", 8, 0.0, 892),
            new MCPServerStatus("Browser", "online", 45, 2.1, 341),
            new MCPServerStatus("Custom", "error", 0, 15.3, 78)
        );
    }
}
