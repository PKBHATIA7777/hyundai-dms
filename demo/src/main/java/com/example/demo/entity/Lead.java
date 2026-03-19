package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

    private String status;
    private String source;
    private LocalDateTime createdAt = LocalDateTime.now();

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
}