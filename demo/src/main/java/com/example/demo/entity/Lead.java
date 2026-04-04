package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "leads",
    indexes = {
        // Fast filter by dealer + status (pipeline view)
        @Index(name = "idx_lead_dealer_status", columnList = "dealer_id, status"),
        // Fast lookup of all leads for a dealer
        @Index(name = "idx_lead_dealer_id", columnList = "dealer_id")
    }
)
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)   // ✅ FIXED: change to EAGER
    @JoinColumn(name = "variant_id")
    @JsonIgnoreProperties({"availableColours", "car", "hibernateLazyInitializer", "handler"})
    private Variant interestedVariant;

    @ManyToOne(fetch = FetchType.EAGER)   // ✅ FIXED: change to EAGER
    @JoinColumn(name = "dealer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Dealer dealer;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'NEW'")
    private String status = "NEW";

    private String source;

    @Column(nullable = false, columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    // --- all existing getters and setters unchanged ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Variant getInterestedVariant() { return interestedVariant; }
    public void setInterestedVariant(Variant interestedVariant) { this.interestedVariant = interestedVariant; }

    public Dealer getDealer() { return dealer; }
    public void setDealer(Dealer dealer) { this.dealer = dealer; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}