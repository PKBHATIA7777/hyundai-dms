package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
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

    // ── ADMIN ──

    @PostMapping("/admin/employees")
    public ResponseEntity<?> createEmployeeForDealer(
            @RequestParam Long dealerId,
            @RequestBody EmployeeDto dto) {
        try {
            Employee employee = employeeService.createEmployeeForDealer(dealerId, dto);
            return ResponseEntity.ok(ApiResponse.success("Employee created.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/employees")
    public ResponseEntity<?> getEmployeesByDealer(@RequestParam Long dealerId) {
        try {
            List<Employee> employees = employeeService.getEmployeesByDealer(dealerId);
            return ResponseEntity.ok(ApiResponse.success(employees));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/employees/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Long id) {
        try {
            Employee employee = employeeService.getEmployeeById(id);
            return ResponseEntity.ok(ApiResponse.success(employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/admin/employees/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeDto dto) {
        try {
            Employee employee = employeeService.updateEmployee(id, dto);
            return ResponseEntity.ok(ApiResponse.success("Employee updated.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/admin/employees/{id}/deactivate")
    public ResponseEntity<?> deactivateEmployee(@PathVariable Long id) {
        try {
            Employee employee = employeeService.deactivateEmployee(id);
            return ResponseEntity.ok(ApiResponse.success("Employee deactivated.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── DEALER ──

    @PostMapping("/dealer/employees")
    public ResponseEntity<?> createMyEmployee(@RequestBody EmployeeDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.createEmployeeForSelf(auth.getName(), dto);
            return ResponseEntity.ok(ApiResponse.success("Employee created.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dealer/employees")
    public ResponseEntity<?> getMyEmployees() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Employee> employees = employeeService.getMyEmployees(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(employees));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dealer/employees/{id}")
    public ResponseEntity<?> getMyEmployeeById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.getMyEmployeeById(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success(employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/dealer/employees/{id}")
    public ResponseEntity<?> updateMyEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.updateMyEmployee(auth.getName(), id, dto);
            return ResponseEntity.ok(ApiResponse.success("Employee updated.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/dealer/employees/{id}/deactivate")
    public ResponseEntity<?> deactivateMyEmployee(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.deactivateMyEmployee(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success("Employee deactivated.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/dealer/employees/{id}/activate")
    public ResponseEntity<?> activateMyEmployee(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Employee employee = employeeService.activateMyEmployee(auth.getName(), id);
            return ResponseEntity.ok(ApiResponse.success("Employee activated.", employee));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}