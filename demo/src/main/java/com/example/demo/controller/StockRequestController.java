package com.example.demo.controller;

import com.example.demo.dto.StockRequestDto;
import com.example.demo.entity.StockRequest;
import com.example.demo.entity.SupplyInvoice;
import com.example.demo.service.StockRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class StockRequestController {

    @Autowired
    private StockRequestService stockRequestService;

    // -------------------------------------------------------
    // POST /api/dealer/stock-requests
    // -------------------------------------------------------
    @PostMapping("/api/dealer/stock-requests")
    public ResponseEntity<?> createRequest(@RequestBody StockRequestDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            StockRequest request = stockRequestService.createRequest(auth.getName(), dto);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/stock-requests
    // -------------------------------------------------------
    @GetMapping("/api/dealer/stock-requests")
    public ResponseEntity<?> getMyRequests() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<StockRequest> requests = stockRequestService.getMyRequests(auth.getName());
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/invoices
    // -------------------------------------------------------
    @GetMapping("/api/dealer/invoices")
    public ResponseEntity<?> getMyInvoices() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<SupplyInvoice> invoices = stockRequestService.getMyInvoices(auth.getName());
            return ResponseEntity.ok(invoices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/admin/stock-requests
    // -------------------------------------------------------
    @GetMapping("/api/admin/stock-requests")
    public ResponseEntity<?> getAllRequests() {
        try {
            List<StockRequest> requests = stockRequestService.getAllRequests();
            return ResponseEntity.ok(requests);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // PUT /api/admin/stock-requests/{id}/approve
    // Body: { "approvedQuantity": 3 }
    // -------------------------------------------------------
    @PutMapping("/api/admin/stock-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Integer> body) {
        try {
            Integer approvedQty = (body != null) ? body.get("approvedQuantity") : null;
            SupplyInvoice invoice = stockRequestService.approveRequest(id, approvedQty);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // PUT /api/admin/stock-requests/{id}/deliver
    // -------------------------------------------------------
    @PutMapping("/api/admin/stock-requests/{id}/deliver")
    public ResponseEntity<?> deliverRequest(@PathVariable Long id) {
        try {
            SupplyInvoice invoice = stockRequestService.deliverRequest(id);
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // PUT /api/admin/stock-requests/{id}/reject-approved
    // -------------------------------------------------------
    @PutMapping("/api/admin/stock-requests/{id}/reject-approved")
    public ResponseEntity<?> rejectApprovedRequest(@PathVariable Long id) {
        try {
            StockRequest request = stockRequestService.rejectApprovedRequest(id);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // PUT /api/admin/stock-requests/{id}/reject
    // For rejecting PENDING requests only
    // -------------------------------------------------------
    @PutMapping("/api/admin/stock-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        try {
            StockRequest request = stockRequestService.rejectRequest(id);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/admin/invoices
    // -------------------------------------------------------
    @GetMapping("/api/admin/invoices")
    public ResponseEntity<?> getAllInvoices() {
        try {
            List<SupplyInvoice> invoices = stockRequestService.getAllInvoices();
            return ResponseEntity.ok(invoices);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}