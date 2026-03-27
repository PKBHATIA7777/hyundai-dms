package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.entity.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAllAuditLogs() {
        try {
            List<AuditLog> logs = auditLogRepository
                    .findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
            return ResponseEntity.ok(ApiResponse.success(logs));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}