package com.example.demo.repository;

import com.example.demo.entity.SaleAccessory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleAccessoryRepository extends JpaRepository<SaleAccessory, Long> {

    List<SaleAccessory> findBySaleId(Long saleId);

    void deleteBySaleId(Long saleId);
}
