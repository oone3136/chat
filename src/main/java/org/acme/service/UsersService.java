package org.acme.service;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.dao.ChatRequest;
import org.acme.dao.UserResponse;
import org.acme.dao.UsersRequest;
import org.acme.entity.ChatMessageEntity;
import org.acme.entity.ChatRoomEntity;
import org.acme.entity.Users;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class UsersService {
    @Transactional
    public Response saveUser(UsersRequest req) {
        Users existingUser = getUsers(req.getUserName());
        Map<String, String> response = new HashMap<>();

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

            response.put("status", "success");
            response.put("message", "thankyou "+req.getUserName()+", your register  berhasil");

        } catch (Exception e) {
            e.printStackTrace();
        }
            return Response.ok(response).build();
    }
    public Users getUsers(String username) {
        return Users.find("userName", username).firstResult();
    }
    public UserResponse getUser(WebSocketConnection connection, String username, String sender, int limit) {
        Users users = Users.find("userName", username).firstResult();
        UserResponse response = new UserResponse();
        ChatRequest chatRequest = new ChatRequest();
        response.setUserName(users.getUserName());
        response.setDisplayName(users.getDisplayName());
        response.setDivisi(users.getDivisi());
        response.setCabang(users.getCabang());
        List<ChatMessageEntity> chatRoomEntities = ChatMessageEntity.find(
                "sender = ?1 or recipient = ?1 or roomCode = ?1 or roomCode LIKE ?2 order by timestamp desc",
                username,
                "%" + sender + "%"
        ).range(0, limit).list();
        List<ChatRequest> chatRequests = new ArrayList<>();
        for (ChatMessageEntity message : chatRoomEntities) {
            chatRequest.setContent(message.getContent());
            chatRequest.setSendTo(message.getRecipient());
            chatRequest.setSender(message.getSender());
            chatRequest.setCreatedDate(message.getTimestamp());
            chatRequests.add(chatRequest);
        }
        response.setChatRequests(chatRequests);
        log.info("response : {}", response);
        return response;
    }
    public List<UsersRequest> getListUsers(){
        UsersRequest user = new UsersRequest();
        List<UsersRequest> list = new ArrayList<>();
        List<Users> users = Users.findAll().list();
        for (Users users1 : users) {
            user.setUserName(users1.getUserName());
            user.setDisplayName(users1.getDisplayName());
            user.setCabang(users1.getCabang());
            user.setDivisi(users1.getDivisi());
            list.add(user);
        }
        return list;
    }
    public List<Users> getUsersByDivisi(String divisi) {
        return Users.find("divisi", divisi).list();
    }
    public List<Users> getUsersByCabang(String cabang) {
        return Users.find("cabang", cabang).list();
    }
    public List<String> getAllUsers() {
        List<Users> allUsers = Users.findAll().list();
        return allUsers.stream()
                .map(Users::getUserName)
                .collect(Collectors.toList()).reversed();
    }
}
