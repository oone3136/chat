package org.acme.dao;

import jakarta.persistence.Column;
import lombok.Data;

import java.util.List;

@Data
public class UsersRequest {
    private String action;
    private String sender;
    private String userName;
    private String password;
    private String displayName;
    private String cabang;
    private String divisi;
    private int limit;
    private String roomCode;
    private List<ChatRequest> chatRequests;
    private ChatRequest chatRequest;
}
