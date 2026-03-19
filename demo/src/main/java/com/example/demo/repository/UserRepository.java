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

    boolean existsByEmail(String email);

    Optional<User> findByDealerId(Long dealerId);

    @Modifying
    @Query("UPDATE User u SET u.failedAttempts = ?1 WHERE u.username = ?2")
    void updateFailedAttempts(int failAttempts, String username);

    @Modifying
    @Query("UPDATE User u SET u.accountNonLocked = ?1 WHERE u.username = ?2")
    void updateAccountNonLocked(boolean accountNonLocked, String username);
}