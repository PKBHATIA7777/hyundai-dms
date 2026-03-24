package com.example.demo.repository;

import com.example.demo.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Get all sales for a specific dealer — latest first
    List<Sale> findByDealerIdOrderBySaleDateDesc(Long dealerId);

    // Get sales by status for a dealer
    List<Sale> findByDealerIdAndSaleStatusOrderBySaleDateDesc(
        Long dealerId, String saleStatus
    );

    // Check if a sale already exists for this booking
    // Prevents double-selling the same booking
    boolean existsByBookingId(Long bookingId);

    // Get single sale by booking id
    Optional<Sale> findByBookingId(Long bookingId);
}