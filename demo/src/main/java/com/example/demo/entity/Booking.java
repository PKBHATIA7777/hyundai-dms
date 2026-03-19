package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
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

    private String paymentMode;
    private String bookingStatus;
    private LocalDateTime bookingDate = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Lead getLead() { return lead; }
    public void setLead(Lead lead) { this.lead = lead; }

    public Variant getVariant() { return variant; }
    public void setVariant(Variant variant) { this.variant = variant; }

    public Colour getColour() { return colour; }
    public void setColour(Colour colour) { this.colour = colour; }

    public Double getBookingAmount() { return bookingAmount; }
    public void setBookingAmount(Double bookingAmount) { this.bookingAmount = bookingAmount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}