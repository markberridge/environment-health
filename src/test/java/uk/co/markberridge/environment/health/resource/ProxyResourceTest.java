package uk.co.markberridge.environment.health.resource;

import static org.fest.assertions.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import io.dropwizard.testing.junit.ResourceTestRule;

import javax.ws.rs.core.MediaType;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

public class ProxyResourceTest {

    private static Client client = mock(Client.class);
    private static WebResource webResource = mock(WebResource.class);
    private static ClientResponse response = mock(ClientResponse.class);

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder().addResource(new ProxyResource(client))
            .build();

    @Before
    public void resetMocks() {
        reset(client, webResource, response);
        when(client.resource("http://www.example.com")).thenReturn(webResource);
        when(webResource.get(ClientResponse.class)).thenReturn(response);
    }

    @Test
    public void test200() {
        assertProxy(200, "{'data':'200'}");
    }

    @Test
    public void test500() {
        assertProxy(500, "{'data':'500'}");
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testConnectionException() {

        when(response.getEntity(String.class)).thenThrow(ClientHandlerException.class);

        ClientResponse clientResponse = resources.client().resource("/proxy")
                .queryParam("url", "http://www.example.com").type(MediaType.TEXT_PLAIN).get(ClientResponse.class);

        assertThat(clientResponse.getStatus()).isEqualTo(404);
        assertThat(clientResponse.getEntity(String.class)).isEqualTo(
                "The health check is not available: http://www.example.com");
    }

    private void assertProxy(int status, String entity) {

        when(response.getStatus()).thenReturn(status);
        when(response.getEntity(String.class)).thenReturn(entity);

        ClientResponse clientResponse = resources.client().resource("/proxy")
                .queryParam("url", "http://www.example.com").type(MediaType.TEXT_PLAIN).get(ClientResponse.class);

        assertThat(clientResponse.getStatus()).isEqualTo(status);
        assertThat(clientResponse.getEntity(String.class)).isEqualTo(entity);
    }
}
