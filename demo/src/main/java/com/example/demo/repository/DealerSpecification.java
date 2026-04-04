package com.example.demo.repository;

import com.example.demo.entity.Dealer;
import org.springframework.data.jpa.domain.Specification;

/**
 * DealerSpecification demonstrates dynamic query building —
 * the same concept as QueryDSL but using Spring Data JPA Specifications.
 * Each method returns a Specification that can be combined with AND/OR.
 */
public class DealerSpecification {

    // Filter by status dynamically — only applied if status is provided
    public static Specification<Dealer> hasStatus(String status) {
        return (root, query, cb) ->
            status == null ? null : cb.equal(root.get("status"), status);
    }

    // Filter by city dynamically — only applied if city is provided
    public static Specification<Dealer> hasCity(String city) {
        return (root, query, cb) ->
            city == null ? null : cb.equal(root.get("city"), city);
    }

    // Filter by name containing search term — case insensitive
    public static Specification<Dealer> nameContains(String name) {
        return (root, query, cb) ->
            name == null ? null : cb.like(cb.lower(root.get("name")),
                                          "%" + name.toLowerCase() + "%");
    }
}