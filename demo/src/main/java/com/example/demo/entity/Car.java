package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String modelName; // e.g., Creta, Verna, Alcazar

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL)
    private List<Variant> variants;
}