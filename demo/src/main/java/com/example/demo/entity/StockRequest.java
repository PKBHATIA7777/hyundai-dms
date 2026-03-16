package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "stock_requests")
public class StockRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    private Variant variant;

    @ManyToOne
    @JoinColumn(name = "colour_id", nullable = false)
    private Colour colour;

    private Integer requestedQuantity;
    
    private String status; // PENDING, APPROVED, REJECTED, FULFILLED

    private LocalDateTime requestDate = LocalDateTime.now();
}
