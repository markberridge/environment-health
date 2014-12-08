package uk.co.markberridge.environment.health.dummyChecks;

import com.codahale.metrics.health.HealthCheck;

public class AlwaysUnhealthyHealthCheck extends HealthCheck {

	private boolean exception;

	public AlwaysUnhealthyHealthCheck(boolean exception) {
		this.exception = exception;
	}

	@Override
	protected Result check() throws Exception {
		if (exception) {
			return Result.unhealthy(new RuntimeException("Error!"));
		}
		return Result.unhealthy("Not healthy");
	}

}
