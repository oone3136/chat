package org.acme.service;

import io.quarkus.websockets.next.WebSocketConnection;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.acme.dao.ChatRequest;
import org.acme.dao.UserResponse;
import org.acme.dao.UsersRequest;
import org.acme.entity.ChatMessageEntity;
import org.acme.entity.ChatRoomEntity;
import org.acme.entity.Users;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@ApplicationScoped
public class UsersService {
    @Transactional
    public Users saveUser(Users users) {
        users.persist();
        return users;
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
