package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@EqualsAndHashCode(callSuper = false)
public class ChatMessageEntity extends PanacheEntity {
    private String roomCode;
    private String sender;
    private String recipient;
    @Column(columnDefinition = "TEXT")
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status;
}
