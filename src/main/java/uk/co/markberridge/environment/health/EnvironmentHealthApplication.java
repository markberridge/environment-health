package uk.co.markberridge.environment.health;

import io.dropwizard.Application;
import io.dropwizard.Configuration;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import uk.co.markberridge.environment.health.resource.ConfigResource;
import uk.co.markberridge.environment.health.resource.PingResource;
import uk.co.markberridge.environment.health.resource.ProxyResource;

import com.sun.jersey.api.client.Client;

/**
 * Main dropwizard service
 */
public class EnvironmentHealthApplication extends Application<Configuration> {

    // private static final Logger log =
    // LoggerFactory.getLogger(EnvironmentHealthApplication.class);

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
    public void initialize(Bootstrap<Configuration> bootstrap) {
        bootstrap.addBundle(new AssetsBundle("/app/", "/health/", "index.html"));
    }

    @Override
    public void run(Configuration config, Environment environment) throws Exception {

        // Resources
        environment.jersey().register(new ProxyResource(new Client()));
        environment.jersey().register(new PingResource());
        environment.jersey().register(new ConfigResource());

        // Health Checks
        environment.healthChecks().register("healthy", new AlwaysHealthyHealthCheck());
        environment.healthChecks().register("random", new RandomHealthCheck(80));
        // environment.healthChecks().register("unhealthy", new AlwaysUnhealthyHealthCheck());
    }
}