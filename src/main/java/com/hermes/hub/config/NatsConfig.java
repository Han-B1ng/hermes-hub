package com.hermes.hub.config;

import io.nats.client.Connection;
import io.nats.client.Nats;
import io.nats.client.Options;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NatsConfig {

    @Value("${nats.server}")
    private String natsServer;

    @Bean(destroyMethod = "close")
    public Connection natsConnection() throws Exception {
        Options options = new Options.Builder()
                .server(natsServer)
                .build();
        return Nats.connect(options);
    }
}
