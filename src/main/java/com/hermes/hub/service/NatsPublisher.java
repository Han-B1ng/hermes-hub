package com.hermes.hub.service;

import io.nats.client.Connection;
import org.springframework.stereotype.Service;

@Service
public class NatsPublisher {

    private final Connection natsConnection;

    public NatsPublisher(Connection natsConnection) {
        this.natsConnection = natsConnection;
    }

    /**
     * 发布消息到指定 NATS 主题。
     * 主题规范：
     *   hermes.agent.>  Agent 上线/下线/状态
     *   hermes.task.>   任务生命周期事件
     *   hermes.tool.>   工具调用事件
     *   hermes.mcp.>    MCP 请求/响应
     *   hermes.system.> 系统事件
     */
    public void publish(String subject, String message) {
        natsConnection.publish(subject, message.getBytes());
    }
}
