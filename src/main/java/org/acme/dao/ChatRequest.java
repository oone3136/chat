package org.acme.dao;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatRequest {
    private String content;
    private String roomCode;
    private String sender;
    private String sendTo;
    private String cabang;
    private String divisi;
    private String status;
    private LocalDateTime createdDate;

}
