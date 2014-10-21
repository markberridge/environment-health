package uk.co.markberridge.environment.health.resource;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;

@Path("/proxy")
public class ProxyResource {

    private static final Logger log = LoggerFactory.getLogger(ProxyResource.class);

    private final Client client;

    public ProxyResource(Client client) {
        this.client = client;
    }

    @Produces(MediaType.APPLICATION_JSON)
    @GET
    public Response proxy(@QueryParam("url") String url) throws Exception {
        log.info("requesting {}", url);
        try {
            ClientResponse response = client.resource(url).get(ClientResponse.class);
            int status = response.getStatus();
            String output = response.getEntity(String.class);
            return Response.status(status).header("Access-Control-Allow-Origin", "*").entity(output).build();
        } catch (Exception e) {
            String m = "The health check is not available: " + url;
            log.info(m, e);
            return Response.status(404).header("Access-Control-Allow-Origin", "*").entity(m).build();
        }
    }
}
