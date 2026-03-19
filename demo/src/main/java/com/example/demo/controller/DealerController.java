package com.example.demo.controller;

import com.example.demo.dto.DealerDto;
import com.example.demo.entity.Dealer;
import com.example.demo.service.DealerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dealers")
public class DealerController {

    @Autowired
    private DealerService dealerService;

    @PostMapping
    public ResponseEntity<?> createDealer(@RequestBody DealerDto dto) {
        try {
            Map<String, Object> response = dealerService.createDealer(dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Dealer>> getAllDealers() {
        return ResponseEntity.ok(dealerService.getAllDealers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDealer(@PathVariable Long id, @RequestBody DealerDto dto) {
        try {
            Dealer dealer = dealerService.updateDealer(id, dto);
            return ResponseEntity.ok(dealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateDealer(@PathVariable Long id) {
        try {
            Dealer dealer = dealerService.deactivateDealer(id);
            return ResponseEntity.ok(dealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateDealer(@PathVariable Long id) {
        try {
            Dealer dealer = dealerService.activateDealer(id);
            return ResponseEntity.ok(dealer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        try {
            Map<String, Object> response = dealerService.resetDealerPassword(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}