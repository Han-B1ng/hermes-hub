package com.hermes.hub.adapter;

import com.hermes.hub.entity.TaskEvent;

import java.util.Map;

public interface AgentAdapter {

    String type();

    void onEvent(TaskEvent event);

    void sendTask(String taskId, String instruction);

    void connect(Map<String, String> config);

    void disconnect();
}
