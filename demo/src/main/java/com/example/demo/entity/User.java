package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(
    name = "users",
    indexes = {
        // Index on username for fast login lookup
        @Index(name = "idx_user_username", columnList = "username"),
        // Index on email for uniqueness checks
        @Index(name = "idx_user_email", columnList = "email"),
        // Index on dealer_id for joining user to dealer
        @Index(name = "idx_user_dealer_id", columnList = "dealer_id")
    }
)
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

    @OneToOne
    @JoinColumn(name = "dealer_id", nullable = true)
    private Dealer dealer;

    @Column(name = "account_non_locked")
    private Boolean accountNonLocked = true;

    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "lock_time")
    private Date lockTime;

    // NEW: account expiry date for Step 7
    @Column(name = "account_expiry_date")
    private Date accountExpiryDate;

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

    public Dealer getDealer() { return dealer; }
    public void setDealer(Dealer dealer) { this.dealer = dealer; }

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

    public Date getAccountExpiryDate() { return accountExpiryDate; }
    public void setAccountExpiryDate(Date accountExpiryDate) {
        this.accountExpiryDate = accountExpiryDate;
    }
}