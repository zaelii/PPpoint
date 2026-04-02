package com.ppoint.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record RegisterDTO(
        String name,

        @Email(message = "Email inválido")
        @NotBlank(message = "Email é obrigatório")
        String email,

        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        @NotBlank(message = "Senha é obrigatória")
        String password
) {}