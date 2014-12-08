package uk.co.markberridge.environment.health.dummyChecks;

import com.codahale.metrics.health.HealthCheck;

public class AlwaysHealthyHealthCheck extends HealthCheck {

	private String message;

	public AlwaysHealthyHealthCheck(String message){
		this.message = message;
	}
	public AlwaysHealthyHealthCheck(){
		this.message = null;
	}
	
    @Override
    protected Result check() throws Exception {
        return message == null? Result.healthy() : Result.healthy(message);
    }

}
