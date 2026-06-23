package org.acme;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String type;
    private String sender;
    private String recipient;
    private String content;
    private String displayName;
    private String cabang;
    private String divisi;
}
