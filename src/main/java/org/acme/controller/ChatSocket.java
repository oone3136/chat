package org.acme.controller;

import io.quarkus.websockets.next.*;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.acme.entity.ChatMessageEntity;
import org.acme.entity.Users;
import org.acme.service.ChatMessageService;
import org.acme.service.ChatRoomService;
import org.acme.service.UsersService;
import org.jboss.logging.Logger;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@WebSocket(path = "/ws-chat")
public class ChatSocket {

    private static final Logger LOG = Logger.getLogger(ChatSocket.class);
    private static final Map<String, WebSocketConnection> sessions = new ConcurrentHashMap<>();

    @Inject
    WebSocketConnection connection;

    @Inject
    UsersService usersService;

    @Inject
    ChatRoomService chatRoomService;

    @Inject
    ChatMessageService chatMessageService;

    @OnOpen
    public void onOpen() {
        connection.sendTextAndAwait("[SYSTEM] Silakan lakukan LOGIN atau REGISTER terlebih dahulu.");
    }

    @OnTextMessage
    @Transactional
    public void onMessage(WebSocketConnection connection, String rawMessage) {
        if (rawMessage == null || rawMessage.trim().isEmpty()) return;

        String[] lines = rawMessage.split("\n");
        String header = lines[0].trim();

        if ("[REGISTER]".equals(header)) {
            handleRegister(connection, lines[1].trim(), lines[2].trim(), lines[3].trim(), lines[4].trim());
            return;
        }

        if ("[LOGIN]".equals(header)) {
            handleLogin(connection, lines[1].trim(), lines[2].trim());
            return;
        }

        if ("[GET_USERS]".equals(header)) {
            String cabang = lines.length > 1 ? lines[1].trim() : "";
            handleGetUsers(connection, cabang);
            return;
        }

        try {
            String type = header.replace("[", "").replace("]", "").trim();
            String sender = lines[1].trim();
            String content = lines[2].trim();
            String roomCode = lines.length > 3 ? lines[3].trim() : "PUBLIC_ROOM";
            ChatMessageEntity chatMessage = new ChatMessageEntity();
            chatMessage.setRoomCode(roomCode);
            chatMessage.setSender(sender);
            chatMessage.setContent(content);
            chatMessage.setTimestamp(LocalDateTime.now());
            chatMessage.setStatus("SENT");

            if ("PRIVATE".equals(type)) {
                chatMessage.setRecipient(roomCode);
            } else {
                chatMessage.setRecipient(type);
            }
            chatMessage.persist();

            String payloadFormat = type + "\n" + sender + "\n" + content + "\n" + roomCode;

            if ("PUBLIC".equals(type)) {
                broadcastRaw(payloadFormat);
            } else {
                broadcastToRoom(roomCode, payloadFormat);
            }

        } catch (Exception e) {
            System.err.println("LOG BE ERROR: Gagal memproses ChatMessageEntity!");
            e.printStackTrace();
        }
    }

    @OnClose
    public void onClose() {
        sessions.entrySet().removeIf(entry -> {
            if (entry.getValue().equals(connection)) {
                broadcastSystemMessage(" [" + entry.getKey() + "] keluar.");
                return true;
            }
            return false;
        });
    }

    @OnError
    public void onError(Throwable throwable) {
        LOG.error("WebSocket Error: ", throwable);
        if (connection.isOpen()) {
            connection.sendTextAndAwait("[SYSTEM ERROR] Gagal memproses data: " + throwable.getMessage());
        }
    }

    private void handleRegister(WebSocketConnection connection, String username, String password, String cabang, String divisi) {
        Users existingUser = usersService.getUsers(username);
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
            newUser.setUserName(username);
            newUser.setPassword(password);
            newUser.setDisplayName(username);
            newUser.setCabang(cabang);
            newUser.setDivisi(divisi);
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

    private void handleLogin(WebSocketConnection connection, String username, String password) {
        Users user = usersService.getUsers(username);

        if (user == null || !user.getPassword().equals(password)) {
            connection.sendTextAndAwait("[LOGIN_FAILED]");
            return;
        }

        sessions.put(username, connection);

        String token = "JWT_TOKEN_" + username + "_" + UUID.randomUUID();
        String singlePayload = "[LOGIN_SUCCESS]|" + token + "|" + user.getCabang() + "|" + user.getDivisi();
        connection.sendTextAndAwait(singlePayload);

        broadcastRaw("SYSTEM\nSYSTEM\n" + username + " bergabung!");
    }

    private void handleGetUsers(WebSocketConnection connection, String userCabang) {
        try {
            List<Users> filteredUsers = Users.list("cabang", userCabang);
            List<String> usernames = filteredUsers.stream()
                    .map(Users::getUserName)
                    .collect(java.util.stream.Collectors.toList());

            String daftarUserString = String.join(",", usernames);
            connection.sendTextAndAwait("[USER_LIST]|" + daftarUserString);
            System.out.println("LOG BE: Sukses mengirim daftar user untuk cabang " + userCabang + " -> " + daftarUserString);

        } catch (Exception e) {
            System.err.println("LOG BE ERROR: Gagal mengambil user terfilter cabang");
            e.printStackTrace();
        }
    }
    private void getUsersAll (WebSocketConnection connection)  {

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

    private void broadcastToRoom(String roomCode, String payload) {
        sessions.forEach((username, conn) -> {
            if (conn.isOpen()) {
                try {
                    Users dbUser = usersService.getUsers(username);
                    if (dbUser != null) {
                        if (roomCode.equalsIgnoreCase(dbUser.getCabang())) {
                            conn.sendTextAndAwait(payload);
                        }
                        else if (roomCode.equalsIgnoreCase(dbUser.getDivisi())) {
                            conn.sendTextAndAwait(payload);
                        }
                        else if (roomCode.contains(username)) {
                            conn.sendTextAndAwait(payload);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Gagal mengirimkan room message ke user: " + username);
                }
            }
        });
    }

    private void broadcastSystemMessage(String text) {
        sessions.values().forEach(s -> { if(s.isOpen()) s.sendTextAndAwait(text); });
    }
}