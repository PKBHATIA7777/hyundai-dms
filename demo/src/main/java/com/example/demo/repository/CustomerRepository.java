package com.example.demo.repository;

import com.example.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Used during booking — check if customer already exists by phone
    Optional<Customer> findByPhone(String phone);

    // Used during booking — check if customer already exists by email
    Optional<Customer> findByEmail(String email);

    // Search customers by name (for lead creation UI)
    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String firstName, String lastName
    );
}