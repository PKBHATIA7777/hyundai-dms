package com.example.demo.controller;

import com.example.demo.dto.LeadDto;
import com.example.demo.entity.Lead;
import com.example.demo.service.LeadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dealer")
public class LeadController {

    @Autowired
    private LeadService leadService;

    // -------------------------------------------------------
    // POST /api/dealer/leads
    // Create a new lead (creates customer if not exists)
    // -------------------------------------------------------
    @PostMapping("/leads")
    public ResponseEntity<?> createLead(@RequestBody LeadDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Lead lead = leadService.createLead(auth.getName(), dto);
            return ResponseEntity.ok(lead);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/leads
    // Get all leads for this dealer
    // Optional query param: ?status=NEW
    // -------------------------------------------------------
    @GetMapping("/leads")
    public ResponseEntity<?> getMyLeads(
            @RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            List<Lead> leads;
            if (status != null && !status.isBlank()) {
                leads = leadService.getMyLeadsByStatus(auth.getName(), status);
            } else {
                leads = leadService.getMyLeads(auth.getName());
            }

            return ResponseEntity.ok(leads);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // PUT /api/dealer/leads/{id}/status
    // Update lead status
    // Body: { "status": "CONTACTED" }
    // -------------------------------------------------------
    @PutMapping("/leads/{id}/status")
    public ResponseEntity<?> updateLeadStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String newStatus = body.get("status");

            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body("Status is required.");
            }

            Lead lead = leadService.updateLeadStatus(auth.getName(), id, newStatus);
            return ResponseEntity.ok(lead);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}