package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "colours")
public class Colour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String colourName;

    @Column(nullable = false, unique = true)
    private String colourCode;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getColourName() { return colourName; }
    public void setColourName(String colourName) { this.colourName = colourName; }

    public String getColourCode() { return colourCode; }
    public void setColourCode(String colourCode) { this.colourCode = colourCode; }
}