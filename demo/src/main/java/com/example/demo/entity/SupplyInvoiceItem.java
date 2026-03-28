package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "supply_invoice_items")
public class SupplyInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "invoice_id", nullable = false)
    private SupplyInvoice invoice;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties({"availableColours", "car", "hibernateLazyInitializer", "handler"})
    private Variant variant;

    @ManyToOne
    @JoinColumn(name = "colour_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Colour colour;

    @Column(nullable = false)
    private Integer quantity;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SupplyInvoice getInvoice() { return invoice; }
    public void setInvoice(SupplyInvoice invoice) { this.invoice = invoice; }

    public Variant getVariant() { return variant; }
    public void setVariant(Variant variant) { this.variant = variant; }

    public Colour getColour() { return colour; }
    public void setColour(Colour colour) { this.colour = colour; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}