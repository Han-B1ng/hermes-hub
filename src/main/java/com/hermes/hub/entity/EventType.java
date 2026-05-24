package com.hermes.hub.entity;

public enum EventType {
    TASK_CREATED,
    TASK_STARTED,
    TASK_COMPLETED,
    TASK_FAILED,

    AGENT_ONLINE,
    AGENT_OFFLINE,
    AGENT_RUNNING,

    TOOL_START,
    TOOL_END,

    MCP_REQUEST,
    MCP_RESPONSE,

    ERROR,
    WARNING,
    INFO
}
