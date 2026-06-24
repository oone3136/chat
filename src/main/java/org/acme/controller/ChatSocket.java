package org.acme.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.websockets.next.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.dao.UsersRequest;
import org.acme.entity.Users;
import org.acme.service.AuthService;
import org.acme.service.ChatMessageService;
import org.acme.service.ChatRoomService;
import org.acme.service.UsersService;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Slf4j
@WebSocket(path = "/ws-chat")
@RequiredArgsConstructor
public class ChatSocket {

    private static final Logger LOG = Logger.getLogger(ChatSocket.class);
    private static final Map<String, WebSocketConnection> sessions = new ConcurrentHashMap<>();

    private final WebSocketConnection connection;
    private final UsersService usersService;
    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final AuthService authService;
    private final ObjectMapper objectMapper;

    @OnOpen
    public void onOpen() {
        connection.sendTextAndAwait("[SYSTEM] Silakan lakukan LOGIN atau REGISTER terlebih dahulu.");
    }


    @OnTextMessage
    @Transactional
    public void onMessage(WebSocketConnection connection, String rawMessage) {
        log.info("message : {}",rawMessage);
        if (rawMessage == null || rawMessage.trim().isEmpty()) return;
        try {
            UsersRequest request = objectMapper.readValue(rawMessage, UsersRequest.class);
            log.info("request convert : {}", request);
            switch (request.getAction()) {
                case "REGISTER":
                    authService.handleRegister(connection, request);
                    break;
                case "LOGIN":
                    authService.handleLogin(connection, request);
                    break;
                case "SEND_MESSAGE":
                    chatMessageService.saveMessage(connection, request);
                    break;
                case "GET_MESSAGE_GLOBAL":
                    chatMessageService.getChatHistory(connection, request);
                    break;
                case "GET_REGISTERED_USERS":
                    usersService.getUser(connection, request.getUserName(), request.getSender(), request.getLimit());
                    break;
                default:
                    connection.sendText("ERROR: Action tidak dikenali");
            }

        } catch (Exception e) {
            connection.sendText("ERROR: Gagal memproses format pesan");
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

    private void handleGetUsers(WebSocketConnection connection, String userCabang) {
        try {
            List<Users> filteredUsers = Users.list("userName", userCabang);
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