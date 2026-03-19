package com.example.demo.dto;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String role;
    private String dealerStatus; // null for admin, ACTIVE/INACTIVE for dealer

    public JwtResponse(String accessToken, Long id, String username, String email, String role, String dealerStatus) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.dealerStatus = dealerStatus;
    }

    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getDealerStatus() { return dealerStatus; }
}