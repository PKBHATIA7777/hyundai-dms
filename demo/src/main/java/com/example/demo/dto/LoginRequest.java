package com.example.demo.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;

    // Manually add getters to fix the "cannot find symbol" error
    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}