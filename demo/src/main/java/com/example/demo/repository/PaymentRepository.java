package com.example.demo.repository;

import com.example.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Get all payments for a specific sale
    List<Payment> findBySaleId(Long saleId);

    // Get all payments for a specific dealer — latest first
    List<Payment> findByDealerIdOrderByPaymentDateDesc(Long dealerId);

    // Get payments by type for a dealer
    // Type: ADVANCE / REMAINING / LOAN
    List<Payment> findByDealerIdAndPaymentTypeOrderByPaymentDateDesc(
        Long dealerId, String paymentType
    );
}