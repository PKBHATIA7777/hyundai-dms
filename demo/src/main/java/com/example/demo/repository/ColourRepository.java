package com.example.demo.repository;

import com.example.demo.entity.Colour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ColourRepository extends JpaRepository<Colour, Long> {
    Optional<Colour> findByColourNameIgnoreCase(String colourName);
    Optional<Colour> findByColourCodeIgnoreCase(String colourCode);
}