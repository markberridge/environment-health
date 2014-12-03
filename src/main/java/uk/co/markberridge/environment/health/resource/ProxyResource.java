package uk.co.markberridge.environment.health.resource;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import uk.co.markberridge.environment.health.service.ProxyService;
import uk.co.markberridge.environment.health.service.ProxyService.ResponseDto;

import com.codahale.metrics.annotation.Timed;

@Path("/proxy")
public class ProxyResource {

	private static final String ACCESS_CONTROL_ALLOW_ORIGIN_HEADER = "Access-Control-Allow-Origin";

	private ProxyService proxyService;

	public ProxyResource(ProxyService proxyService) {
		this.proxyService = proxyService;
	}

	@GET
	@Timed
	@Produces(APPLICATION_JSON)
	public Response proxy(@QueryParam("url") String url) throws Exception {
		ResponseDto response = proxyService.getProxyResponse(url);

		return Response.status(response.getStatus())//
				.header(ACCESS_CONTROL_ALLOW_ORIGIN_HEADER, "*")//
				.entity(response.getText()).build();
	}
}
