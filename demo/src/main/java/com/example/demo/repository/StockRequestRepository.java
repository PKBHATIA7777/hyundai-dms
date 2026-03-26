package com.example.demo.repository;

import com.example.demo.entity.StockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRequestRepository extends JpaRepository<StockRequest, Long> {

    List<StockRequest> findByDealerIdOrderByRequestDateDesc(Long dealerId);

    List<StockRequest> findAllByOrderByRequestDateDesc();

    @Query("SELECT COUNT(s) FROM StockRequest s WHERE s.status = 'PENDING'")
    long countPendingRequests();

    @Query("SELECT COUNT(s) FROM StockRequest s WHERE s.dealer.id = :dealerId AND s.status = 'PENDING'")
    long countPendingByDealer(@Param("dealerId") Long dealerId);
}