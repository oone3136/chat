package org.acme.config;

import io.quarkus.websockets.next.OnError;
import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

@ApplicationScoped
public class ChatExceptionMapper {

    private static final Logger LOG = Logger.getLogger(ChatExceptionMapper.class);

    @OnError
    public void handleBusinessException(ChatBusinessException ex, WebSocketConnection connection) {
        LOG.warn("Business error pada koneksi chat: " + ex.getMessage());
        if (connection.isOpen()) {
            connection.sendTextAndAwait("[SYSTEM ERROR] " + ex.getMessage());
        }
    }
    @OnError
    public void handleGlobalException(Exception ex, WebSocketConnection connection) {
        LOG.error("Terjadi error sistem pada WebSocket: ", ex);

        if (connection.isOpen()) {
            connection.sendTextAndAwait("[SYSTEM ERROR] Format pesan tidak valid atau terjadi gangguan server.");
        }
    }
}
