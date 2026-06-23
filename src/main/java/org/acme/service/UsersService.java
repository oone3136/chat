package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.acme.entity.Users;

import java.util.List;
import java.util.stream.Collectors;

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
