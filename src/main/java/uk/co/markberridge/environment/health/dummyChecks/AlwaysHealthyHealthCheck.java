package uk.co.markberridge.environment.health.dummyChecks;

import com.codahale.metrics.health.HealthCheck;

public class AlwaysHealthyHealthCheck extends HealthCheck {

    @Override
    protected Result check() throws Exception {
        return Result.healthy();
    }

}
