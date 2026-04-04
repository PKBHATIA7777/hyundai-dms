package com.example.demo.repository;

import com.example.demo.entity.Dealer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, Long>,
        JpaSpecificationExecutor<Dealer> {  // ADD JpaSpecificationExecutor
    boolean existsByNameIgnoreCase(String name);
}