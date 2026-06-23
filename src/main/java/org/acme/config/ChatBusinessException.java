package org.acme.config;

public class ChatBusinessException extends RuntimeException{
    public ChatBusinessException(String message) {
        super(message);
    }
}
