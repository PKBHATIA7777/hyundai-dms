package com.example.demo.controller;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.entity.Employee;
import com.example.demo.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // -------------------------------------------------------
    // ADMIN — Create employee for a specific dealer
    // POST /api/admin/employees?dealerId=2
    // -------------------------------------------------------
    @PostMapping("/admin/employees")
    public ResponseEntity<?> createEmployeeForDealer(
            @RequestParam Long dealerId,
            @RequestBody EmployeeDto dto) {
        try {
            Employee employee = employeeService.createEmployeeForDealer(dealerId, dto);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Get all employees of a specific dealer
    // GET /api/admin/employees?dealerId=2
    // -------------------------------------------------------
    @GetMapping("/admin/employees")
    public ResponseEntity<?> getEmployeesByDealer(@RequestParam Long dealerId) {
        try {
            List<Employee> employees = employeeService.getEmployeesByDealer(dealerId);
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Update any employee
    // PUT /api/admin/employees/{id}
    // -------------------------------------------------------
    @PutMapping("/admin/employees/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeDto dto) {
        try {
            Employee employee = employeeService.updateEmployee(id, dto);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // ADMIN — Deactivate any employee
    // PUT /api/admin/employees/{id}/deactivate
    // -------------------------------------------------------
    @PutMapping("/admin/employees/{id}/deactivate")
    public ResponseEntity<?> deactivateEmployee(@PathVariable Long id) {
        try {
            Employee employee = employeeService.deactivateEmployee(id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Create employee for their own dealership
    // POST /api/dealer/employees
    // -------------------------------------------------------
    @PostMapping("/dealer/employees")
    public ResponseEntity<?> createMyEmployee(@RequestBody EmployeeDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.createEmployeeForSelf(auth.getName(), dto);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Get all employees in their own dealership
    // GET /api/dealer/employees
    // -------------------------------------------------------
    @GetMapping("/dealer/employees")
    public ResponseEntity<?> getMyEmployees() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Employee> employees = employeeService.getMyEmployees(auth.getName());
            return ResponseEntity.ok(employees);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Update their own employee
    // PUT /api/dealer/employees/{id}
    // -------------------------------------------------------
    @PutMapping("/dealer/employees/{id}")
    public ResponseEntity<?> updateMyEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.updateMyEmployee(auth.getName(), id, dto);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Deactivate their own employee
    // PUT /api/dealer/employees/{id}/deactivate
    // -------------------------------------------------------
    @PutMapping("/dealer/employees/{id}/deactivate")
    public ResponseEntity<?> deactivateMyEmployee(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.deactivateMyEmployee(auth.getName(), id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // DEALER — Activate their own employee
    // PUT /api/dealer/employees/{id}/activate
    // -------------------------------------------------------
    @PutMapping("/dealer/employees/{id}/activate")
    public ResponseEntity<?> activateMyEmployee(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.activateMyEmployee(auth.getName(), id);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
