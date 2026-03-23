package com.example.demo.repository;

import com.example.demo.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Get all leads for a specific dealer — latest first
    List<Lead> findByDealerIdOrderByCreatedAtDesc(Long dealerId);

    // Get leads by status for a dealer
    List<Lead> findByDealerIdAndStatusOrderByCreatedAtDesc(Long dealerId, String status);

    // Check if a lead already exists for this customer at this dealer
    boolean existsByCustomerIdAndDealerId(Long customerId, Long dealerId);
}