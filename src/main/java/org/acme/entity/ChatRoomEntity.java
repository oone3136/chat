package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Data
@EqualsAndHashCode(callSuper = false)
public class ChatRoomEntity extends PanacheEntity {
    private String roomCode;
    private String roomName;
    private Long senderId;
    private String Message;
    private LocalDateTime createdAt = LocalDateTime.now();
}
