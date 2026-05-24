package com.hermes.hub.adapter;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdapterRegistry {

    private static final Logger log = LoggerFactory.getLogger(AdapterRegistry.class);

    private final ConcurrentHashMap<String, AgentAdapter> adapters = new ConcurrentHashMap<>();

    private final List<AgentAdapter> adapterList;

    public AdapterRegistry(List<AgentAdapter> adapterList) {
        this.adapterList = adapterList;
    }

    public void register(AgentAdapter adapter) {
        adapters.put(adapter.type(), adapter);
    }

    public AgentAdapter getAdapter(String type) {
        return adapters.get(type);
    }

    public Collection<AgentAdapter> getAllAdapters() {
        return adapters.values();
    }

    public void removeAdapter(String type) {
        adapters.remove(type);
    }

    @PostConstruct
    void init() {
        for (AgentAdapter adapter : adapterList) {
            register(adapter);
            log.info("Auto-registered adapter: {}", adapter.type());
        }
        log.info("Registered {} adapter(s)", adapters.size());
    }
}
