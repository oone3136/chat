package org.acme.service;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.acme.dao.ChatRequest;
import org.acme.dao.UsersRequest;
import org.acme.entity.ChatMessageEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@ApplicationScoped
public class ChatMessageService {
    private static final Map<String, WebSocketConnection> sessions = new ConcurrentHashMap<>();
    @Transactional
    public ChatMessageEntity saveMessage(WebSocketConnection connection, UsersRequest req) {
        sessions.put(req.getUserName(), connection);
        ChatMessageEntity msg = new ChatMessageEntity();
        msg.setRoomCode(req.getRoomCode());
        msg.setSender(req.getUserName());
        msg.setRecipient(req.getChatRequest().getRoomCode());
        msg.setContent(req.getChatRequest().getContent());
        msg.setTimestamp(LocalDateTime.now());
        msg.setStatus(req.getChatRequest().getStatus());
        msg.persist();
        return msg;
    }

    public List<ChatMessageEntity> getPendingMessagesForUser(String username) {
        return ChatMessageEntity.list("recipient = ?1 and status = 'PENDING' order by timestamp asc", username);
    }
    @Transactional
    public void markAsDelivered(String username) {
        ChatMessageEntity.update("status = 'DELIVERED' where recipient = ?1 and status = 'PENDING'", username);
    }
    public List<ChatMessageEntity> getChatHistory(WebSocketConnection connection,UsersRequest request) {
        return ChatMessageEntity.find("roomCode = ?1 order by timestamp desc", request.getRoomCode())
                .page(0, request.getLimit())
                .list();
    }
    public Response getListMessage(String request, int limit) {
        List<ChatMessageEntity> getList = new ArrayList<>();
        try {
            getList = ChatMessageEntity.find("roomCode = ?1 order by timestamp desc", request)
                    .page(0, limit)
                    .list();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return Response.ok(getList).build();
    }

}
