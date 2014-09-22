package com.learndirect.environment.health;

import com.codahale.metrics.health.HealthCheck;

public class AlwaysUnhealthyHealthCheck extends HealthCheck {

    @Override
    protected Result check() throws Exception {
        return Result.unhealthy("Not healthy");
    }

}
