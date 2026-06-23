package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.acme.entity.ChatMessageEntity;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@ApplicationScoped
public class ChatMessageService {
    @Transactional
    public ChatMessageEntity saveMessage(String roomCode, String sender, String recipient, String content, boolean isOnline) {
        ChatMessageEntity msg = new ChatMessageEntity();
        msg.setRoomCode(roomCode);
        msg.setSender(sender);
        msg.setRecipient(recipient);
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());
        msg.setStatus(isOnline ? "DELIVERED" : "PENDING");
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
    public List<ChatMessageEntity> getChatHistory(String roomCode, int limit) {
        return ChatMessageEntity.find("roomCode = ?1 order by timestamp desc", roomCode)
                .page(0, limit)
                .list();
    }

}
