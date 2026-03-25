package com.example.demo.repository;

import com.example.demo.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByDealerId(Long dealerId);

    List<Employee> findByDealerIdAndStatus(Long dealerId, String status);

    Optional<Employee> findByPhone(String phone);

    Optional<Employee> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);
}