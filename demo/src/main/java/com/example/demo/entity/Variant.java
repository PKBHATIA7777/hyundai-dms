package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "variants")
public class Variant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String variantName;

    // ✅ Updated: Use BigDecimal for price
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @JsonIgnoreProperties({"variants", "hibernateLazyInitializer", "handler"})
    @ManyToOne
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    // ✅ FIX: Added fetch = FetchType.EAGER
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "variant_colours",
        joinColumns = @JoinColumn(name = "variant_id"),
        inverseJoinColumns = @JoinColumn(name = "colour_id")
    )
    private Set<Colour> availableColours = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    // ✅ Updated getter
    public BigDecimal getPrice() {
        return price;
    }

    // ✅ Updated setter
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public Set<Colour> getAvailableColours() {
        return availableColours;
    }

    public void setAvailableColours(Set<Colour> availableColours) {
        this.availableColours = availableColours;
    }
}