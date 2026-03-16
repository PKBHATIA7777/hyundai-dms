package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "leads")
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "variant_id")
    private Variant interestedVariant;

    @ManyToOne
    @JoinColumn(name = "dealer_id")
    private Dealer dealer;

    private String status; // NEW, CONTACTED, INTERESTED, CLOSED, CONVERTED
    
    private String source; // Walk-in, Website, Referral
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
