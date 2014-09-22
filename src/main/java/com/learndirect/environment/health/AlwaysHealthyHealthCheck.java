package com.learndirect.environment.health;

import com.codahale.metrics.health.HealthCheck;

public class AlwaysHealthyHealthCheck extends HealthCheck {

    @Override
    protected Result check() throws Exception {
        return Result.healthy();
    }

}
