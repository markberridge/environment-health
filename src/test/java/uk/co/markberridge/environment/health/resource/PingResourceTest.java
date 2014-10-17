package uk.co.markberridge.environment.health.resource;

import static org.fest.assertions.api.Assertions.assertThat;

import javax.ws.rs.core.MediaType;

import io.dropwizard.testing.junit.ResourceTestRule;

import org.junit.ClassRule;
import org.junit.Test;

import com.sun.jersey.api.client.ClientResponse;

public class PingResourceTest {

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder().addResource(new PingResource()).build();

    @Test
    public void test() {

        ClientResponse clientResponse = resources.client()
                                                 .resource("/ping")
                                                 .type(MediaType.TEXT_PLAIN)
                                                 .get(ClientResponse.class);

        assertThat(clientResponse.getStatus()).isEqualTo(200);
        assertThat(clientResponse.getEntity(String.class)).isEqualTo("pong");
    }
}
