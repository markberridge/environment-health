package uk.co.markberridge.environment.health;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import uk.co.markberridge.environment.health.dummyChecks.AlwaysHealthyHealthCheck;
import uk.co.markberridge.environment.health.dummyChecks.RandomHealthCheck;
import uk.co.markberridge.environment.health.resource.ConfigResource;
import uk.co.markberridge.environment.health.resource.PingResource;
import uk.co.markberridge.environment.health.resource.ProxyResource;
import uk.co.markberridge.environment.health.service.ProxyService;

import com.codahale.metrics.health.HealthCheckRegistry;
import com.codahale.metrics.servlets.HealthCheckServlet;
import com.sun.jersey.api.client.Client;

/**
 * Main dropwizard service
 */
public class EnvironmentHealthApplication extends Application<HealthConfiguration> {

    public static void main(String... args) throws Exception {
        if (args.length == 0) {
            String configFileName = new OverrideConfig("environment-health.yml").getName();
            new EnvironmentHealthApplication().run(new String[] { "server", configFileName });
        } else {
            new EnvironmentHealthApplication().run(args);
        }
    }

    @Override
    public String getName() {
        return "environment-health";
    }

    @Override
    public void initialize(Bootstrap<HealthConfiguration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/app/", "/health/", "index.html"));
    }

    @Override
    public void run(HealthConfiguration config, Environment environment) throws Exception {

        Client client = new JerseyClientBuilder(environment).build("proxyClient");

        // Services
        ProxyService proxyService = new ProxyService(environment.metrics(), client, config.getCacheDuration());

        // Resources
        environment.jersey().register(new ProxyResource(proxyService));
        environment.jersey().register(new PingResource());
        environment.jersey().register(new ConfigResource());

        if (config.isTestMode()) {
            for (int id = 1; id < 8; id++) {
                HealthCheckRegistry registry = new HealthCheckRegistry();
                registry.register("randomHealthCheck" + id, new RandomHealthCheck(80));
                HealthCheckServlet servlet = new HealthCheckServlet(registry);
                environment.servlets().addServlet("testHealthCheckServlet" + id, servlet).addMapping("/health" + id);
            }
        }

        // Health Checks
        environment.healthChecks().register("healthy", new AlwaysHealthyHealthCheck());
        environment.healthChecks().register("random", new RandomHealthCheck(80));
        // environment.healthChecks().register("unhealthy", new
        // AlwaysUnhealthyHealthCheck());
    }
}