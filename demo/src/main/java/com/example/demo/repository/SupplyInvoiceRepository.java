package com.example.demo.repository;

import com.example.demo.entity.SupplyInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplyInvoiceRepository extends JpaRepository<SupplyInvoice, Long> {

    List<SupplyInvoice> findByDealerId(Long dealerId);

    Optional<SupplyInvoice> findByStockRequestId(Long stockRequestId);
}