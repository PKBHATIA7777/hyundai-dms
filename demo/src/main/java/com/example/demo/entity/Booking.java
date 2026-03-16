package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    private Variant variant;

    @ManyToOne
    @JoinColumn(name = "colour_id", nullable = false)
    private Colour colour;

    @Column(nullable = false)
    private Double bookingAmount;

    private String paymentMode; // Cash, Card, Online, Cheque
    
    private String bookingStatus; // ACTIVE, CANCELLED, COMPLETED

    private LocalDateTime bookingDate = LocalDateTime.now();
}