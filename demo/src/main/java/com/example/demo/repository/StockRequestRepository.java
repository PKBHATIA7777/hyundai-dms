package com.example.demo.repository;
import com.example.demo.entity.StockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRequestRepository extends JpaRepository<StockRequest, Long> { }
