package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    // ✅ Update failed login attempts
    @Modifying
    @Query("UPDATE User u SET u.failedAttempts = ?1 WHERE u.username = ?2")
    void updateFailedAttempts(int failAttempts, String username);

    // ✅ Lock/Unlock user account
    @Modifying
    @Query("UPDATE User u SET u.accountNonLocked = ?1 WHERE u.username = ?2")
    void updateAccountNonLocked(boolean accountNonLocked, String username);
}