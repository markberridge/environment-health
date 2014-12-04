package uk.co.markberridge.environment.health;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;
import io.dropwizard.util.Duration;

public class HealthConfiguration extends Configuration {

    @JsonProperty
    private Duration cacheDuration = Duration.seconds(2);

    @JsonProperty
    private boolean testMode = false;

    public Duration getCacheDuration() {
        return cacheDuration;
    }

    public boolean isTestMode() {
        return testMode;
    }
}
