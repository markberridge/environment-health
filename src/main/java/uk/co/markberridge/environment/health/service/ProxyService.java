package uk.co.markberridge.environment.health.service;

import static java.util.concurrent.TimeUnit.SECONDS;
import io.dropwizard.util.Duration;

import java.util.Objects;
import java.util.concurrent.ExecutionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.codahale.metrics.Meter;
import com.codahale.metrics.MetricRegistry;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.UncheckedExecutionException;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;

public class ProxyService {
	static final String METER_NAME = ProxyLoader.class.getName() + ".loads";
	private static final Logger log = LoggerFactory.getLogger(ProxyService.class);

	private LoadingCache<String, ResponseDto> responseCache;

	public ProxyService(MetricRegistry metricRegistry, Client client, Duration cacheDuration) {
		this.responseCache = CacheBuilder.newBuilder()//
				.expireAfterAccess(cacheDuration.toSeconds(), SECONDS) //
				.maximumSize(100).build(new ProxyLoader(metricRegistry, client));
	}

	public ResponseDto getProxyResponse(String url) {
		try {
			log.info("requesting {}", url);
			return responseCache.get(url);
		} catch (ExecutionException | UncheckedExecutionException e) {
			String message = "The health check is not available at: " + url;
			log.info(message, e);
			return ResponseDto.notFound(message);
		}
	}

	private static class ProxyLoader extends CacheLoader<String, ResponseDto> {

		private Client client;
		private Meter meter;

		public ProxyLoader(MetricRegistry metricRegistry, Client client) {
			this.meter = metricRegistry.meter(METER_NAME);
			this.client = client;
		}

		@Override
		public ResponseDto load(String url) throws Exception {
			meter.mark();
			ClientResponse response = client.resource(url).get(ClientResponse.class);
			return ResponseDto.of(response.getStatus(), response.getEntity(String.class));
		}
	}

	public static class ResponseDto {
		private String text;
		private int status;

		private ResponseDto(String text, int status) {
			this.text = text;
			this.status = status;
		}

		public static ResponseDto of(int status, String message) {
			return new ResponseDto(message, status);
		}

		public static ResponseDto notFound(String message) {
			return new ResponseDto(message, 404);
		}

		public int getStatus() {
			return status;
		}

		public String getText() {
			return text;
		}

		@Override
		public int hashCode() {
			return Objects.hash(status, text);
		}

		@Override
		public boolean equals(Object obj) {
			if (this == obj)
				return true;
			if (obj == null)
				return false;
			if (getClass() != obj.getClass())
				return false;
			ResponseDto other = (ResponseDto) obj;
			return Objects.equals(status, other.status) && Objects.equals(text, other.text);
		}

	}
}
