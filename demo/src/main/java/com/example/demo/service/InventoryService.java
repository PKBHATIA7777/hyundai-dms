package com.example.demo.service;

import com.example.demo.entity.Dealer;
import com.example.demo.entity.DealerInventory;
import com.example.demo.entity.Variant;
import com.example.demo.entity.Colour;
import com.example.demo.repository.DealerInventoryRepository;
import com.example.demo.repository.DealerRepository;
import com.example.demo.repository.VariantRepository;
import com.example.demo.repository.ColourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    @Autowired
    private DealerInventoryRepository inventoryRepository;

    @Autowired
    private DealerRepository dealerRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private ColourRepository colourRepository;


    // -------------------------------------------------------
    // ADMIN: Add stock to a dealer
    // -------------------------------------------------------
    @Transactional
    public DealerInventory addStock(Long dealerId, Long variantId, Long colourId, int quantity) {

        // Rule: quantity must be positive
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero.");
        }

        // Check dealer exists
        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        // Check variant exists
        Variant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found."));

        // Check colour exists
        Colour colour = colourRepository.findById(colourId)
                .orElseThrow(() -> new RuntimeException("Colour not found."));

        // Check if a row already exists for this dealer + variant + colour
        Optional<DealerInventory> existing = inventoryRepository
                .findByDealerIdAndVariantIdAndColourId(dealerId, variantId, colourId);

        if (existing.isPresent()) {
            // Row exists — just increase the stock quantity
            DealerInventory inventory = existing.get();
            inventory.setStockQuantity(inventory.getStockQuantity() + quantity);
            return inventoryRepository.save(inventory);
        } else {
            // Row does not exist — create a brand new inventory row
            DealerInventory inventory = new DealerInventory();
            inventory.setDealer(dealer);
            inventory.setVariant(variant);
            inventory.setColour(colour);
            inventory.setStockQuantity(quantity);
            inventory.setReservedQuantity(0);
            return inventoryRepository.save(inventory);
        }
    }


    // -------------------------------------------------------
    // DEALER: Get all inventory for a dealer
    // -------------------------------------------------------
    public List<DealerInventory> getInventoryByDealer(Long dealerId) {

        // Check dealer exists
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        return inventoryRepository.findByDealerId(dealerId);
    }


    // -------------------------------------------------------
    // INTERNAL USE (Day 7+): Reserve stock when booking is made
    // -------------------------------------------------------
    @Transactional
    public void reserveStock(Long dealerId, Long variantId, Long colourId) {

        DealerInventory inventory = inventoryRepository
                .findByDealerIdAndVariantIdAndColourId(dealerId, variantId, colourId)
                .orElseThrow(() -> new RuntimeException("No inventory found for this combination."));

        // Rule: cannot reserve if available stock is zero
        if (inventory.getAvailableStock() <= 0) {
            throw new RuntimeException("Insufficient stock. Cannot make booking.");
        }

        inventory.setReservedQuantity(inventory.getReservedQuantity() + 1);
        inventoryRepository.save(inventory);
    }


    // -------------------------------------------------------
    // INTERNAL USE (Day 8+): Reduce stock when sale is completed
    // -------------------------------------------------------
    @Transactional
    public void reduceStock(Long dealerId, Long variantId, Long colourId) {

        DealerInventory inventory = inventoryRepository
                .findByDealerIdAndVariantIdAndColourId(dealerId, variantId, colourId)
                .orElseThrow(() -> new RuntimeException("No inventory found for this combination."));

        // Rule: stock cannot go negative
        if (inventory.getStockQuantity() <= 0) {
            throw new RuntimeException("Stock is already zero. Cannot reduce further.");
        }

        inventory.setStockQuantity(inventory.getStockQuantity() - 1);

        // Also release the reservation
        if (inventory.getReservedQuantity() > 0) {
            inventory.setReservedQuantity(inventory.getReservedQuantity() - 1);
        }

        inventoryRepository.save(inventory);
    }
}