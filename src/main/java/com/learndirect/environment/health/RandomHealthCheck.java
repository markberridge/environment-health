package com.learndirect.environment.health;

import com.codahale.metrics.health.HealthCheck;

public class RandomHealthCheck extends HealthCheck {

    private final int threshhold;

    public RandomHealthCheck(int threshhold) {
        this.threshhold = threshhold;
    }

    @Override
    protected Result check() throws Exception {
        int i = (int) (Math.random() * 100d);
        return i <= threshhold ? Result.healthy(msg(i)) : Result.unhealthy(msg(i));
    }

    private String msg(int i) {
        return String.format("%s/%s", i, threshhold);
    }

}
