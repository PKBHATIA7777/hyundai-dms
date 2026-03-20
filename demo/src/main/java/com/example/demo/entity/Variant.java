package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
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

    @Column(nullable = false)
    private Long price;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToMany
    @JoinTable(
        name = "variant_colours",
        joinColumns = @JoinColumn(name = "variant_id"),
        inverseJoinColumns = @JoinColumn(name = "colour_id")
    )
    private Set<Colour> availableColours = new HashSet<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public Long getPrice() { return price; }
    public void setPrice(Long price) { this.price = price; }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }

    public Set<Colour> getAvailableColours() { return availableColours; }
    public void setAvailableColours(Set<Colour> availableColours) { this.availableColours = availableColours; }
}