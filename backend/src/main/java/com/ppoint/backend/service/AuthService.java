package com.ppoint.backend.service;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repository;
    private final EncryptionService crypto;
    private final JwtService jwtService;

    public AuthService(UserRepository repository, EncryptionService crypto, JwtService jwtService) {
        this.repository = repository;
        this.crypto = crypto;
        this.jwtService = jwtService;
    }

    public void register(String name, String email, String password) {
        if (repository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        User user = new User();
        //user.setId(UUID.randomUUID());
        //setId desnecessário com a geração automática via Hibernate
        user.setName(name);
        user.setEmail(email);
        user.setPassword(crypto.encrypt(password));
        user.setRole("USER");

        repository.save(user);
    }

    public String login(String email, String password) {
        User user = repository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!crypto.compare(password, user.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        return jwtService.generateToken(user.getEmail());
    }
}