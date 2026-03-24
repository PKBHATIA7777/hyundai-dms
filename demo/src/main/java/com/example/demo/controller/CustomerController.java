package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    // -------------------------------------------------------
    // ADMIN — Get all customers in the system
    // GET /api/admin/customers
    // -------------------------------------------------------
    @GetMapping("/admin/customers")
    public ResponseEntity<?> getAllCustomers(
            @RequestParam(required = false) String search) {
        try {
            List<Customer> customers;

            if (search != null && !search.isBlank()) {
                customers = customerRepository
                        .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                                search, search);
            } else {
                customers = customerRepository.findAll();
            }

            return ResponseEntity.ok(customers);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Get single customer by ID
    // GET /api/admin/customers/{id}
    // -------------------------------------------------------
    @GetMapping("/admin/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            Customer customer = customerRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Customer not found."));
            return ResponseEntity.ok(customer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Search customers by phone (for booking lookup)
    // GET /api/dealer/customers/search?phone=9876543210
    // -------------------------------------------------------
    @GetMapping("/dealer/customers/search")
    public ResponseEntity<?> searchCustomerByPhone(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String name) {
        try {
            if (phone != null && !phone.isBlank()) {
                return customerRepository.findByPhone(phone)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
            }

            if (name != null && !name.isBlank()) {
                List<Customer> customers = customerRepository
                        .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                                name, name);
                return ResponseEntity.ok(customers);
            }

            return ResponseEntity.badRequest()
                    .body("Please provide phone or name search parameter.");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}