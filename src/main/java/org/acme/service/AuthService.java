package org.acme.service;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.dao.ChatRequest;
import org.acme.dao.UsersRequest;
import org.acme.entity.Users;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class AuthService {
    private final UsersService usersService;
    private static final Map<String, WebSocketConnection> sessions = new ConcurrentHashMap<>();

    @Transactional
    public void handleRegister(WebSocketConnection connection, UsersRequest req) {
        Users existingUser = usersService.getUsers(req.getUserName());
        if (existingUser != null) {
            connection.sendTextAndAwait("[REG_FAILED]");
            return;
        }

        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            KeyPair pair = keyGen.generateKeyPair();

            String publicKeyBase64 = Base64.getEncoder().encodeToString(pair.getPublic().getEncoded());
            String privateKeyBase64 = Base64.getEncoder().encodeToString(pair.getPrivate().getEncoded());

            Users newUser = new Users();
            newUser.setUserName(req.getUserName());
            newUser.setPassword(req.getPassword());
            newUser.setDisplayName(req.getDisplayName());
            newUser.setCabang(req.getCabang());
            newUser.setDivisi(req.getDivisi());
            newUser.setPublicKey(publicKeyBase64);
            newUser.setPrivateKey(privateKeyBase64);
            newUser.setLastSent(LocalDateTime.now());

            newUser.persist();
            connection.sendTextAndAwait("[REG_SUCCESS]");

        } catch (Exception e) {
            e.printStackTrace();
            connection.sendTextAndAwait("[REG_FAILED]");
        }
    }
    public void handleLogin(WebSocketConnection connection, UsersRequest req) {
        log.info("req : {}", req);
        Users user = usersService.getUsers(req.getUserName());

        if (user == null || !user.getPassword().equals(req.getPassword())) {
            log.info("login filed");
            connection.sendTextAndAwait("[LOGIN_FAILED]");
            return;
        }

        sessions.put(req.getUserName(), connection);
        log.info("sessions : {}", sessions);

        String token = "JWT_TOKEN_" + req.getUserName() + "_" + UUID.randomUUID();
        String singlePayload = "[LOGIN_SUCCESS]|" + token + "|" + user.getCabang() + "|" + user.getDivisi();
        connection.sendTextAndAwait(singlePayload);

        broadcastRaw("SYSTEM\nSYSTEM\n" + req.getUserName() + " bergabung!");
    }
    private void broadcastRaw(String text) {
        System.out.println("LOG BE: Memulai broadcast menggunakan Map sessions -> " + text);
        sessions.values().forEach(conn -> {
            if (conn.isOpen()) {
                try {
                    conn.sendTextAndAwait(text);
                } catch (Exception e) {
                    System.err.println("Gagal broadcast: " + e.getMessage());
                }
            }
        });
    }
}
