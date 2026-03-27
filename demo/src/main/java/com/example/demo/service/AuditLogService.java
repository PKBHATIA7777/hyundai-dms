package com.example.demo.service;

import com.example.demo.entity.AuditLog;
import com.example.demo.entity.User;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Logs an action. Uses REQUIRES_NEW so the audit log is always saved
     * even if the calling transaction rolls back.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String details, String performedByUsername) {
        try {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setDetails(details);
            log.setTimestamp(LocalDateTime.now());

            if (performedByUsername != null) {
                userRepository.findByUsername(performedByUsername)
                        .ifPresent(log::setPerformedBy);
            }

            auditLogRepository.save(log);
        } catch (Exception e) {
            // Never let audit logging break the main flow
            System.err.println("Audit log failed: " + e.getMessage());
        }
    }
}