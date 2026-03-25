package com.example.demo.service;

import com.example.demo.dto.AccessoryDto;
import com.example.demo.entity.Accessory;
import com.example.demo.repository.AccessoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AccessoryService {

    @Autowired
    private AccessoryRepository accessoryRepository;

    // -------------------------------------------------------
    // ADMIN: Create a new accessory
    // -------------------------------------------------------
    @Transactional
    public Accessory createAccessory(AccessoryDto dto) {

        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Accessory name is required.");
        }
        if (dto.getPrice() == null || dto.getPrice() <= 0) {
            throw new RuntimeException("Accessory price must be greater than zero.");
        }
        if (accessoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("An accessory with this name already exists.");
        }

        Accessory accessory = new Accessory();
        accessory.setName(dto.getName());
        accessory.setPrice(dto.getPrice());
        accessory.setDescription(dto.getDescription());
        accessory.setStatus("ACTIVE");

        return accessoryRepository.save(accessory);
    }

    // -------------------------------------------------------
    // ALL: Get all active accessories (for dropdowns)
    // -------------------------------------------------------
    public List<Accessory> getAllActiveAccessories() {
        return accessoryRepository.findByStatus("ACTIVE");
    }

    // -------------------------------------------------------
    // ADMIN: Get all accessories including inactive
    // -------------------------------------------------------
    public List<Accessory> getAllAccessories() {
        return accessoryRepository.findAll();
    }

    // -------------------------------------------------------
    // ADMIN: Update accessory details
    // -------------------------------------------------------
    @Transactional
    public Accessory updateAccessory(Long id, AccessoryDto dto) {

        Accessory accessory = accessoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accessory not found."));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            // Check name uniqueness — exclude self
            accessoryRepository.findByNameIgnoreCase(dto.getName())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new RuntimeException(
                                "An accessory with this name already exists.");
                        }
                    });
            accessory.setName(dto.getName());
        }

        if (dto.getPrice() != null) {
            if (dto.getPrice() <= 0) {
                throw new RuntimeException("Price must be greater than zero.");
            }
            accessory.setPrice(dto.getPrice());
        }

        if (dto.getDescription() != null) {
            accessory.setDescription(dto.getDescription());
        }

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            if (!dto.getStatus().equals("ACTIVE") && !dto.getStatus().equals("INACTIVE")) {
                throw new RuntimeException("Status must be ACTIVE or INACTIVE.");
            }
            accessory.setStatus(dto.getStatus());
        }

        return accessoryRepository.save(accessory);
    }

    // -------------------------------------------------------
    // ADMIN: Deactivate an accessory
    // -------------------------------------------------------
    @Transactional
    public Accessory deactivateAccessory(Long id) {
        Accessory accessory = accessoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accessory not found."));
        accessory.setStatus("INACTIVE");
        return accessoryRepository.save(accessory);
    }

    // -------------------------------------------------------
    // INTERNAL: Get accessory by ID (used in SaleService)
    // -------------------------------------------------------
    public Accessory getById(Long id) {
        return accessoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Accessory not found with id: " + id));
    }
}
