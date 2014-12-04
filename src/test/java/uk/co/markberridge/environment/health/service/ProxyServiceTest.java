package uk.co.markberridge.environment.health.service;

import static org.fest.assertions.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import io.dropwizard.util.Duration;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import uk.co.markberridge.environment.health.service.ProxyService.ResponseDto;

import com.codahale.metrics.Meter;
import com.codahale.metrics.MetricRegistry;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;

import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ProxyServiceTest {

    private static Client client = mock(Client.class);
    private static MetricRegistry metricRegistry = mock(MetricRegistry.class);
    private static Meter meter = mock(Meter.class);
    private static WebResource webResource = mock(WebResource.class);
    private static ClientResponse response = mock(ClientResponse.class);

    private static ProxyService proxyService;

    @Before
    public void resetMocks() {
        reset(client, webResource, response, metricRegistry, meter);
        when(client.resource("http://www.example.com")).thenReturn(webResource);
        when(webResource.get(ClientResponse.class)).thenReturn(response);
        when(metricRegistry.meter(ProxyService.METER_NAME)).thenReturn(meter);
        proxyService = new ProxyService(metricRegistry, client, Duration.seconds(1));
    }

    @Test
    public void test200() {
        when(response.getStatus()).thenReturn(200);
        when(response.getEntity(String.class)).thenReturn("{'data':'200'}");

        ResponseDto responseDto = proxyService.getProxyResponse("http://www.example.com");

        assertThat(responseDto.getStatus()).isEqualTo(200);
        assertThat(responseDto.getText()).isEqualTo("{'data':'200'}");
        verify(meter).mark();
    }

    @Test
    public void test500() {
        when(response.getStatus()).thenReturn(200);
        when(response.getEntity(String.class)).thenReturn("{'data':'200'}");

        ResponseDto responseDto = proxyService.getProxyResponse("http://www.example.com");

        assertThat(responseDto.getStatus()).isEqualTo(200);
        assertThat(responseDto.getText()).isEqualTo("{'data':'200'}");
        verify(meter).mark();
    }

    @Test
    public void checkMeterRecordsMultipleRequests() {
        when(response.getStatus()).thenReturn(200);
        when(response.getEntity(String.class)).thenReturn("{'data':'200'}");

        proxyService.getProxyResponse("http://www.example.com1");
        proxyService.getProxyResponse("http://www.example.com2");

        verify(meter, times(2)).mark();
    }

    @Test
    public void checkCacheWorks() {
        when(response.getStatus()).thenReturn(200);
        when(response.getEntity(String.class)).thenReturn("{'data':'200'}");

        proxyService.getProxyResponse("http://www.example.com");
        proxyService.getProxyResponse("http://www.example.com");

        verify(meter, times(1)).mark();
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testConnectionException() {

        when(response.getEntity(String.class)).thenThrow(ClientHandlerException.class);

        ResponseDto responseDto = proxyService.getProxyResponse("http://www.example.com");

        assertThat(responseDto.getStatus()).isEqualTo(404);
        assertThat(responseDto.getText()).isEqualTo("The health check is not available at: http://www.example.com");
        verify(meter).mark();
    }

}
