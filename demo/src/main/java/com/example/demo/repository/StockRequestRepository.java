package com.example.demo.repository;

import com.example.demo.entity.StockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRequestRepository extends JpaRepository<StockRequest, Long> {

    // Latest requests first
    List<StockRequest> findByDealerIdOrderByRequestDateDesc(Long dealerId);

    // All requests latest first
    List<StockRequest> findAllByOrderByRequestDateDesc();
}