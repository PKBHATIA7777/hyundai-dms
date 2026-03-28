package com.example.demo.controller;

import com.example.demo.entity.Customer;
import com.example.demo.entity.Sale;
import com.example.demo.entity.Dealer;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.SaleRepository;
import com.example.demo.repository.DealerRepository;
import com.example.demo.entity.User;
import com.example.demo.dto.ApiResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private DealerRepository dealerRepository;

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

            // Add dealerName to response
            List<Map<String, Object>> result = customers.stream().map(customer -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("customer", customer);

                String dealerName = saleRepository.findAll().stream()
                        .filter(s -> s.getCustomer() != null
                                && s.getCustomer().getId().equals(customer.getId()))
                        .map(s -> s.getDealer() != null ? s.getDealer().getName() : null)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse(null);

                map.put("dealerName", dealerName);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Get customers grouped by dealer
    // GET /api/admin/customers/by-dealer
    // -------------------------------------------------------
    @GetMapping("/admin/customers/by-dealer")
    public ResponseEntity<?> getCustomersGroupedByDealer() {
        try {
            List<Dealer> dealers = dealerRepository.findAll();

            List<Map<String, Object>> result = dealers.stream().map(dealer -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("dealer", dealer);

                List<Customer> customers = saleRepository.findAll().stream()
                        .filter(s -> s.getDealer() != null
                                && s.getDealer().getId().equals(dealer.getId()))
                        .map(Sale::getCustomer)
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList());

                entry.put("customers", customers);
                entry.put("customerCount", customers.size());

                return entry;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
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
    // ADMIN — Get all sales for a specific customer
    // GET /api/admin/customers/{id}/sales
    // -------------------------------------------------------
    @GetMapping("/admin/customers/{id}/sales")
    public ResponseEntity<?> getCustomerSales(@PathVariable Long id) {
        try {
            customerRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Customer not found."));

            List<Sale> sales = saleRepository.findAll().stream()
                    .filter(s -> s.getCustomer() != null
                            && s.getCustomer().getId().equals(id))
                    .sorted((a, b) -> b.getSaleDate().compareTo(a.getSaleDate()))
                    .toList();

            return ResponseEntity.ok(ApiResponse.success(sales));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // -------------------------------------------------------
    // DEALER — Search customers by phone (for booking lookup)
    // GET /api/dealer/customers/search
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