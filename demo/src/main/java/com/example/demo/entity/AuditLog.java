package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // e.g., "STOCK_UPDATE", "BOOKING_CREATED", "USER_LOGIN"

    @Column(columnDefinition = "TEXT")
    private String details; // e.g., "Dealer 1 increased Creta stock by 5"

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User performedBy;

    private LocalDateTime timestamp = LocalDateTime.now();

    private String ipAddress;
}
