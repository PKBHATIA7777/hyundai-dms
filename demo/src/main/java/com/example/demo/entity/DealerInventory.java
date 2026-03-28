package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(
    name = "dealer_inventory",
    uniqueConstraints = @jakarta.persistence.UniqueConstraint(
        name = "uk_dealer_variant_colour",
        columnNames = {"dealer_id", "variant_id", "colour_id"}
    )
)
public class DealerInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dealer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Dealer dealer;

    // ✅ UPDATED: FetchType set to EAGER to ensure car is loaded with variant
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties({"availableColours", "hibernateLazyInitializer", "handler"})
    private Variant variant;

    @ManyToOne
    @JoinColumn(name = "colour_id", nullable = false)
    private Colour colour;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    public int getAvailableStock() {
        return stockQuantity - reservedQuantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Dealer getDealer() { return dealer; }
    public void setDealer(Dealer dealer) { this.dealer = dealer; }

    public Variant getVariant() { return variant; }
    public void setVariant(Variant variant) { this.variant = variant; }

    public Colour getColour() { return colour; }
    public void setColour(Colour colour) { this.colour = colour; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }
}