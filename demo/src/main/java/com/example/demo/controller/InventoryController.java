package com.example.demo.controller;

import com.example.demo.dto.AddStockDto;
import com.example.demo.entity.DealerInventory;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private UserRepository userRepository;


    // -------------------------------------------------------
    // ADMIN: Add stock to a dealer
    // POST /api/admin/inventory/add
    // Body: { dealerId, variantId, colourId, quantity }
    // -------------------------------------------------------
    @PostMapping("/admin/inventory/add")
    public ResponseEntity<?> addStock(@RequestBody AddStockDto dto) {
        try {
            DealerInventory inventory = inventoryService.addStock(
                    dto.getDealerId(),
                    dto.getVariantId(),
                    dto.getColourId(),
                    dto.getQuantity()
            );
            return ResponseEntity.ok(inventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // -------------------------------------------------------
    // ADMIN: Get inventory of any dealer by dealerId
    // GET /api/admin/inventory/{dealerId}
    // -------------------------------------------------------
    @GetMapping("/admin/inventory/{dealerId}")
    public ResponseEntity<?> getInventoryByDealerId(@PathVariable Long dealerId) {
        try {
            List<DealerInventory> inventory = inventoryService.getInventoryByDealer(dealerId);
            return ResponseEntity.ok(inventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // -------------------------------------------------------
    // DEALER: Get their own inventory
    // GET /api/dealer/inventory
    // No params needed — dealer ID is fetched from logged in user
    // -------------------------------------------------------
    @GetMapping("/dealer/inventory")
    public ResponseEntity<?> getMyInventory() {
        try {
            // Step 1: Get the username from the JWT token (Spring Security handles this)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            // Step 2: Find the User record from database using username
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found."));

            // Step 3: Get the dealer linked to this user
            if (user.getDealer() == null) {
                return ResponseEntity.badRequest().body("No dealer account linked to this user.");
            }

            Long dealerId = user.getDealer().getId();

            // Step 4: Fetch inventory for that dealer
            List<DealerInventory> inventory = inventoryService.getInventoryByDealer(dealerId);
            return ResponseEntity.ok(inventory);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}