package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "account_non_locked")
    private Boolean accountNonLocked = true;

    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "lock_time")
    private Date lockTime;

    // --- Standard Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Boolean getAccountNonLocked() { 
        return accountNonLocked != null ? accountNonLocked : true; 
    }
    public void setAccountNonLocked(Boolean accountNonLocked) { 
        this.accountNonLocked = accountNonLocked; 
    }

    public Integer getFailedAttempts() { 
        return failedAttempts != null ? failedAttempts : 0; 
    }
    public void setFailedAttempts(Integer failedAttempts) { 
        this.failedAttempts = failedAttempts; 
    }

    public Date getLockTime() { return lockTime; }
    public void setLockTime(Date lockTime) { this.lockTime = lockTime; }
}