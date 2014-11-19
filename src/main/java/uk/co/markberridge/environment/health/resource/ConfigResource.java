package uk.co.markberridge.environment.health.resource;

import java.io.File;
import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import com.google.common.base.Charsets;
import com.google.common.base.Throwables;
import com.google.common.io.Files;

@Path("/config")
public class ConfigResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String getConfig(){
        try {
            return Files.toString(new File("environments.json"), Charsets.UTF_8);
        } catch (IOException e) {
            throw Throwables.propagate(e);
        }
    }
    
}
