package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.acme.entity.ChatRoomEntity;

import java.util.List;

@RequiredArgsConstructor
@ApplicationScoped
public class ChatRoomService {
    @Transactional
    public ChatRoomEntity createRoomIfNotExist(String roomCode, String roomName) {
        ChatRoomEntity existingRoom = ChatRoomEntity.find("roomCode", roomCode).firstResult();

        if (existingRoom == null) {
            ChatRoomEntity newRoom = new ChatRoomEntity();
            newRoom.setRoomCode(roomCode);
            newRoom.setRoomName(roomName);
            newRoom.persist();
            return newRoom;
        }

        return existingRoom;
    }
    public ChatRoomEntity getRoomByCode(String roomCode) {
        return ChatRoomEntity.find("roomCode", roomCode).firstResult();
    }

    public List<ChatRoomEntity> getAllRooms() {
        return ChatRoomEntity.listAll();
    }

    public List<ChatRoomEntity> searchRoomsByName(String roomName) {
        return ChatRoomEntity.list("roomName like ?1", "%" + roomName + "%");
    }
}
