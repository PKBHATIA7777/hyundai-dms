package com.example.demo.controller;

import com.example.demo.dto.AccessoryDto;
import com.example.demo.entity.Accessory;
import com.example.demo.service.AccessoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AccessoryController {

    @Autowired
    private AccessoryService accessoryService;

    // -------------------------------------------------------
    // ADMIN — Create a new accessory
    // POST /api/admin/accessories
    // -------------------------------------------------------
    @PostMapping("/admin/accessories")
    public ResponseEntity<?> createAccessory(@RequestBody AccessoryDto dto) {
        try {
            Accessory accessory = accessoryService.createAccessory(dto);
            return ResponseEntity.ok(accessory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Get all accessories (including inactive)
    // GET /api/admin/accessories
    // -------------------------------------------------------
    @GetMapping("/admin/accessories")
    public ResponseEntity<List<Accessory>> getAllAccessories() {
        return ResponseEntity.ok(accessoryService.getAllAccessories());
    }

    // -------------------------------------------------------
    // ADMIN — Update accessory
    // PUT /api/admin/accessories/{id}
    // -------------------------------------------------------
    @PutMapping("/admin/accessories/{id}")
    public ResponseEntity<?> updateAccessory(
            @PathVariable Long id,
            @RequestBody AccessoryDto dto) {
        try {
            Accessory accessory = accessoryService.updateAccessory(id, dto);
            return ResponseEntity.ok(accessory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Deactivate accessory
    // PUT /api/admin/accessories/{id}/deactivate
    // -------------------------------------------------------
    @PutMapping("/admin/accessories/{id}/deactivate")
    public ResponseEntity<?> deactivateAccessory(@PathVariable Long id) {
        try {
            Accessory accessory = accessoryService.deactivateAccessory(id);
            return ResponseEntity.ok(accessory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Get all active accessories (for sale form)
    // GET /api/dealer/accessories
    // -------------------------------------------------------
    @GetMapping("/dealer/accessories")
    public ResponseEntity<List<Accessory>> getActiveAccessories() {
        return ResponseEntity.ok(accessoryService.getAllActiveAccessories());
    }
}