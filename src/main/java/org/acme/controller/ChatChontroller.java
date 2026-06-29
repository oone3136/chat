package org.acme.controller;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.dao.ChatRequest;
import org.acme.service.ChatMessageService;

@Slf4j
@RequiredArgsConstructor
@Path("/api/chat")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ChatChontroller {
    private final ChatMessageService chatMessageService;
    @GET
    @Path("/list-public/{room}/{limit}")
    public Response getListMessage(@PathParam("room") String room, @PathParam("limit") int limit) {
        return chatMessageService.getListMessage(room, limit);
    }
}
