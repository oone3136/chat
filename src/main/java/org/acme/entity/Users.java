package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
@EqualsAndHashCode(callSuper = false)
public class Users extends PanacheEntity{
    @Column(unique = true, nullable = false, length = 20)
    private String userName;
    private String password;
    @Column(nullable = false, length = 50)
    private String displayName;
    @Column(length = 20)
    private String cabang;
    @Column(length = 20)
    private String divisi;
    private LocalDateTime lastSent;
    @Column(length = 3000)
    private String privateKey;
    @Column(length = 2048)
    private String publicKey;
}
