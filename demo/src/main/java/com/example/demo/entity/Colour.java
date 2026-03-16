package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "colours")
public class Colour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String colourName; // e.g., Abyss Black, Atlas White, Titan Grey

    @Column(nullable = false, unique = true)
    private String colourCode; // e.g., RBP, WAW
}