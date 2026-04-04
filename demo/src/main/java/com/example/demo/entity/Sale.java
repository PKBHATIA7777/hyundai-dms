package com.example.demo.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Table(
    name = "sales",
    indexes = {
        // Fast lookup of sales by dealer (most common query)
        @Index(name = "idx_sale_dealer_id", columnList = "dealer_id"),
        // Fast lookup by date for dashboard revenue queries
        @Index(name = "idx_sale_date", columnList = "sale_date"),
        // Composite index for dealer + date range queries
        @Index(name = "idx_sale_dealer_date", columnList = "dealer_id, sale_date")
    }
)
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lead", "employee"})
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "dealer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Dealer dealer;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties({"availableColours", "car", "hibernateLazyInitializer", "handler"})
    private Variant variant;

    @ManyToOne
    @JoinColumn(name = "colour_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Colour colour;

    // Employee who handled this sale (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = true)
    @JsonIgnoreProperties({"dealer", "hibernateLazyInitializer", "handler"})
    private Employee employee;

    @Column(nullable = false)
    private Double totalAmount; // Base car amount before accessories

    @Column(nullable = false)
    private Double advancePaid;

    @Column(nullable = false)
    private Double remainingAmount;

    // Total accessories amount (sum of all sale_accessories)
    @Column(nullable = false)
    private Double accessoriesAmount = 0.0;

    // Insurance premium (0 if no insurance)
    @Column(nullable = false)
    private Double insuranceAmount = 0.0;

    // Grand total = totalAmount + accessoriesAmount + insuranceAmount
    @Column(nullable = false)
    private Double grandTotal = 0.0;

    private String paymentMode;

    @Column(nullable = false)
    private String saleStatus = "COMPLETED";

    @Column(nullable = false)
    private LocalDateTime saleDate = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Accessories attached to this sale
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"sale", "hibernateLazyInitializer", "handler"})
    private List<SaleAccessory> saleAccessories;

    // Insurance for this sale (optional)
    @OneToOne(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"sale", "hibernateLazyInitializer", "handler"})
    private Insurance insurance;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Variant getVariant() {
        return variant;
    }

    public void setVariant(Variant variant) {
        this.variant = variant;
    }

    public Colour getColour() {
        return colour;
    }

    public void setColour(Colour colour) {
        this.colour = colour;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Double getAdvancePaid() {
        return advancePaid;
    }

    public void setAdvancePaid(Double advancePaid) {
        this.advancePaid = advancePaid;
    }

    public Double getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(Double remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public Double getAccessoriesAmount() {
        return accessoriesAmount;
    }

    public void setAccessoriesAmount(Double accessoriesAmount) {
        this.accessoriesAmount = accessoriesAmount;
    }

    public Double getInsuranceAmount() {
        return insuranceAmount;
    }

    public void setInsuranceAmount(Double insuranceAmount) {
        this.insuranceAmount = insuranceAmount;
    }

    public Double getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getSaleStatus() {
        return saleStatus;
    }

    public void setSaleStatus(String saleStatus) {
        this.saleStatus = saleStatus;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<SaleAccessory> getSaleAccessories() {
        return saleAccessories;
    }

    public void setSaleAccessories(List<SaleAccessory> saleAccessories) {
        this.saleAccessories = saleAccessories;
    }

    public Insurance getInsurance() {
        return insurance;
    }

    public void setInsurance(Insurance insurance) {
        this.insurance = insurance;
    }
}