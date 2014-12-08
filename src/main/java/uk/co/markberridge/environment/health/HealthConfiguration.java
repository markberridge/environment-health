package uk.co.markberridge.environment.health;

import javax.validation.Valid;

import io.dropwizard.Configuration;
import io.dropwizard.client.JerseyClientConfiguration;
import io.dropwizard.util.Duration;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HealthConfiguration extends Configuration {

    @JsonProperty
    private Duration cacheDuration = Duration.seconds(2);

    @JsonProperty
    private boolean testMode = false;

    @Valid
    @JsonProperty
    private JerseyClientConfiguration proxyClientConfig = new JerseyClientConfiguration();

    public Duration getCacheDuration() {
        return cacheDuration;
    }

    public boolean isTestMode() {
        return testMode;
    }

    public JerseyClientConfiguration getProxyClientConfig() {
        return proxyClientConfig;
    }
}
