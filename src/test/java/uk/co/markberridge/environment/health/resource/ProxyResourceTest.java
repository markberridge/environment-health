package uk.co.markberridge.environment.health.resource;

import static javax.ws.rs.core.MediaType.TEXT_PLAIN;
import static org.fest.assertions.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import io.dropwizard.testing.junit.ResourceTestRule;

import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;

import uk.co.markberridge.environment.health.service.ProxyService;
import uk.co.markberridge.environment.health.service.ProxyService.ResponseDto;

import com.sun.jersey.api.client.ClientResponse;

public class ProxyResourceTest {

    private static ProxyService proxyService = mock(ProxyService.class);

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
                                                                     .addResource(new ProxyResource(proxyService))
                                                                     .build();

    @Before
    public void resetMocks() {
        reset(proxyService);
    }

    @Test
    public void testSuccess() {
        when(proxyService.getProxyResponse("http://www.example.com")).thenReturn(ResponseDto.of(200, "message"));

        ClientResponse clientResponse = resources.client().resource("/proxy")//
                                                 .queryParam("url", "http://www.example.com")
                                                 .type(TEXT_PLAIN)
                                                 .get(ClientResponse.class);

        assertThat(clientResponse.getStatus()).isEqualTo(200);
        assertThat(clientResponse.getEntity(String.class)).isEqualTo("message");
    }

}