package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.entity.Payment;
import com.example.demo.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    // GET /api/admin/payments — all payments across all dealers
    @GetMapping("/payments")
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> payments = paymentRepository.findAllOrderByPaymentDateDesc();
            return ResponseEntity.ok(ApiResponse.success(payments));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}