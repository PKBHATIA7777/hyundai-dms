package com.example.demo.controller;

import com.example.demo.dto.SaleDto;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Sale;
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

    // -------------------------------------------------------
    // POST /api/dealer/sales
    // Convert a confirmed booking into a sale
    // Body: { bookingId, remainingAmount, paymentMode, notes }
    // -------------------------------------------------------
    @PostMapping("/sales")
    public ResponseEntity<?> createSale(@RequestBody SaleDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Sale sale = saleService.createSale(auth.getName(), dto);
            return ResponseEntity.ok(sale);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/sales
    // Get all sales for this dealer
    // -------------------------------------------------------
    @GetMapping("/sales")
    public ResponseEntity<?> getMySales() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Sale> sales = saleService.getMySales(auth.getName());
            return ResponseEntity.ok(sales);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/sales/{id}
    // Get single sale details
    // -------------------------------------------------------
    @GetMapping("/sales/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Sale sale = saleService.getSaleById(auth.getName(), id);
            return ResponseEntity.ok(sale);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/sales/{id}/payments
    // Get all payments for a specific sale
    // -------------------------------------------------------
    @GetMapping("/sales/{id}/payments")
    public ResponseEntity<?> getPaymentsForSale(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Payment> payments = saleService.getPaymentsForSale(auth.getName(), id);
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/payments
    // Get all payments for this dealer
    // -------------------------------------------------------
    @GetMapping("/payments")
    public ResponseEntity<?> getMyPayments() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Payment> payments = saleService.getMyPayments(auth.getName());
            return ResponseEntity.ok(payments);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}