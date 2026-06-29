package org.acme.controller;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.config.ChatBusinessException;
import org.acme.dao.UsersRequest;
import org.acme.entity.Users;
import org.acme.service.UsersService;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;

@Slf4j
@ApplicationScoped
@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class UsersController {
    private final UsersService usersService;

    @POST
    @Path("/register")
    @Transactional
    public Response saveUser(@RequestBody UsersRequest req) {
        Users existingUser = usersService.getUsers(req.getUserName());

        if (existingUser != null && existingUser.isPersistent()) {
            throw new ChatBusinessException("Username '" + req.getUserName() + "' telah digunakan");
        }

        return usersService.saveUser(req);
    }

}
