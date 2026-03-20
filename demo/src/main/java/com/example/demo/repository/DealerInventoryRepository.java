package com.example.demo.repository;

import com.example.demo.entity.DealerInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerInventoryRepository extends JpaRepository<DealerInventory, Long> {

    // Get all inventory rows for a specific dealer
    List<DealerInventory> findByDealerId(Long dealerId);

    // Find a specific row: dealer + variant + colour combination
    Optional<DealerInventory> findByDealerIdAndVariantIdAndColourId(
        Long dealerId, Long variantId, Long colourId
    );
}