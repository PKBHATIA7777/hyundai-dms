package com.example.demo.controller;

import com.example.demo.entity.Dealer;
import com.example.demo.repository.DealerRepository;
import com.example.demo.repository.DealerSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Demonstrates dynamic query building using JPA Specifications.
 * All filter params are optional — queries are built dynamically
 * based on what is provided. Same concept as QueryDSL.
 *
 * Example: GET /api/admin/dealers/search?status=ACTIVE&city=Chennai
 */
@RestController
@RequestMapping("/api/admin/dealers")
public class DealerSearchController {

    @Autowired
    private DealerRepository dealerRepository;

    @GetMapping("/search")
    public ResponseEntity<List<Dealer>> searchDealers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name) {

        // Build specification dynamically — only add filters that are provided
        Specification<Dealer> spec = Specification
                .where(DealerSpecification.hasStatus(status))
                .and(DealerSpecification.hasCity(city))
                .and(DealerSpecification.nameContains(name));

        List<Dealer> result = dealerRepository.findAll(spec);
        return ResponseEntity.ok(result);
    }
}