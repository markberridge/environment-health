package uk.co.markberridge.environment.health.resource;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

@Path("/ping")
@Produces("text/plain")
public class PingResource {

    @GET
    public String ping() {
        return "pong";
    }
}
