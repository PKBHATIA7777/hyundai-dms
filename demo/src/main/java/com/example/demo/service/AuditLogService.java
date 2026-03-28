package com.example.demo.service;

import com.example.demo.entity.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void log(String action, String details, String performedByUsername) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setDetails(details);
            log.setTimestamp(LocalDateTime.now());

            // ✅ FIXED: only query DB if username is non-null and non-blank
            if (performedByUsername != null && !performedByUsername.isBlank()) {
                userRepository.findByUsername(performedByUsername)
                        .ifPresent(log::setPerformedBy);
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Audit log failed: " + e.getMessage());
        }
    }
}