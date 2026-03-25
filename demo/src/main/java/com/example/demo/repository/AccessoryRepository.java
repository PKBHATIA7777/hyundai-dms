package com.example.demo.repository;

import com.example.demo.entity.Accessory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccessoryRepository extends JpaRepository<Accessory, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Accessory> findByNameIgnoreCase(String name);

    // Only return active accessories for selection
    List<Accessory> findByStatus(String status);
}