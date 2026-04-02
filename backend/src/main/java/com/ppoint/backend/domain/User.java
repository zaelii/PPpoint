package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String instagramUser;

    @Column(unique = true)
    private String email;
    private String password;
    private String role;
    private String provider;
    private String googleId;
    private String picture;

}