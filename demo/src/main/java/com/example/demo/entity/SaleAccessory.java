package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "sale_accessories")
public class SaleAccessory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "booking",
                           "customer", "dealer", "variant", "colour"})
    private Sale sale;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accessory_id", nullable = false)
    private Accessory accessory;

    @Column(nullable = false)
    private Integer quantity = 1;

    // Price at time of sale — snapshot so price changes don't affect history
    @Column(nullable = false)
    private Double priceAtSale;

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sale getSale() { return sale; }
    public void setSale(Sale sale) { this.sale = sale; }

    public Accessory getAccessory() { return accessory; }
    public void setAccessory(Accessory accessory) { this.accessory = accessory; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPriceAtSale() { return priceAtSale; }
    public void setPriceAtSale(Double priceAtSale) { this.priceAtSale = priceAtSale; }

    @jakarta.persistence.Transient
    public Double getTotalPrice() {
        return priceAtSale * quantity;
    }
}