package com.example.demo.repository;

import com.example.demo.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {

    Optional<Insurance> findBySaleId(Long saleId);

    boolean existsBySaleId(Long saleId);

    boolean existsByPolicyNumber(String policyNumber);
}