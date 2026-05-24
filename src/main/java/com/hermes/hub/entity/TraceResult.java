package com.hermes.hub.entity;

import lombok.Data;

import java.util.List;

@Data
public class TraceResult {
    private Task task;
    private List<TraceNode> nodes;
}
