package org.acme.dao;

import lombok.Data;

import java.util.List;

@Data
public class UserResponse {
    private String userName;
    private String displayName;
    private String cabang;
    private String divisi;
    private List<ChatRequest> chatRequests;
}
