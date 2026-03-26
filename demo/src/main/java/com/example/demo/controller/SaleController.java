package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.SaleDto;
import com.example.demo.entity.*;
import com.example.demo.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dealer")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @PostMapping("/sales")
    public ResponseEntity<?> createSale(@RequestBody SaleDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Sale sale = saleService.createSale(auth.getName(), dto);
            return ResponseEntity.ok(ApiResponse.success("Sale completed successfully.", sale));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sales")
    public ResponseEntity<?> getMySales() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Sale> sales = saleService.getMySales(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(sales));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sales/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Sale sale = saleService.getSaleById(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success(sale));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sales/{id}/accessories")
    public ResponseEntity<?> getAccessoriesForSale(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<SaleAccessory> accessories = saleService.getAccessoriesForSale(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success(accessories));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sales/{id}/insurance")
    public ResponseEntity<?> getInsuranceForSale(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Insurance insurance = saleService.getInsuranceForSale(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success(insurance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/sales/{id}/payments")
    public ResponseEntity<?> getPaymentsForSale(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Payment> payments = saleService.getPaymentsForSale(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success(payments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/payments")
    public ResponseEntity<?> getMyPayments() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Payment> payments = saleService.getMyPayments(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(payments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}