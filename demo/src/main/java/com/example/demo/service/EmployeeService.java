package com.example.demo.service;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.Employee;
import com.example.demo.repository.DealerRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DealerRepository dealerRepository;

    @Autowired
    private UserRepository userRepository;

    // -------------------------------------------------------
    // ADMIN: Add employee to any dealer by dealerId
    // -------------------------------------------------------
    @Transactional
    public Employee createEmployeeForDealer(Long dealerId, EmployeeDto dto) {

        Dealer dealer = dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        validateUniqueFields(dto, null);

        Employee employee = buildEmployee(dto, dealer);
        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // DEALER: Add employee to their own dealership
    // -------------------------------------------------------
    @Transactional
    public Employee createEmployeeForSelf(String username, EmployeeDto dto) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        validateUniqueFields(dto, null);

        Employee employee = buildEmployee(dto, user.getDealer());
        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // ADMIN: Get all employees for a specific dealer
    // -------------------------------------------------------
    public List<Employee> getEmployeesByDealer(Long dealerId) {
        dealerRepository.findById(dealerId)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));
        return employeeRepository.findByDealerId(dealerId);
    }

    // -------------------------------------------------------
    // DEALER: Get all employees in their own dealership
    // -------------------------------------------------------
    public List<Employee> getMyEmployees(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }
        return employeeRepository.findByDealerId(user.getDealer().getId());
    }

    // -------------------------------------------------------
    // ADMIN: Update any employee
    // -------------------------------------------------------
    @Transactional
    public Employee updateEmployee(Long employeeId, EmployeeDto dto) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        validateUniqueFields(dto, employeeId);

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPhone(dto.getPhone());
        employee.setEmail(dto.getEmail());
        employee.setDesignation(dto.getDesignation());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            if (!dto.getStatus().equals("ACTIVE") && !dto.getStatus().equals("INACTIVE")) {
                throw new RuntimeException("Status must be ACTIVE or INACTIVE.");
            }
            employee.setStatus(dto.getStatus());
        }

        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // DEALER: Update their own employee
    // -------------------------------------------------------
    @Transactional
    public Employee updateMyEmployee(String username, Long employeeId, EmployeeDto dto) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        if (!employee.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this employee.");
        }

        validateUniqueFields(dto, employeeId);

        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPhone(dto.getPhone());
        employee.setEmail(dto.getEmail());
        employee.setDesignation(dto.getDesignation());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            if (!dto.getStatus().equals("ACTIVE") && !dto.getStatus().equals("INACTIVE")) {
                throw new RuntimeException("Status must be ACTIVE or INACTIVE.");
            }
            employee.setStatus(dto.getStatus());
        }

        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // ADMIN: Deactivate any employee
    // -------------------------------------------------------
    @Transactional
    public Employee deactivateEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));
        employee.setStatus("INACTIVE");
        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // DEALER: Deactivate their own employee
    // -------------------------------------------------------
    @Transactional
    public Employee deactivateMyEmployee(String username, Long employeeId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        if (!employee.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this employee.");
        }

        employee.setStatus("INACTIVE");
        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // DEALER: Activate their own employee
    // -------------------------------------------------------
    @Transactional
    public Employee activateMyEmployee(String username, Long employeeId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        if (!employee.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this employee.");
        }

        employee.setStatus("ACTIVE");
        return employeeRepository.save(employee);
    }

    // -------------------------------------------------------
    // DEALER: Get single employee (must belong to their dealer)
    // -------------------------------------------------------
    public Employee getMyEmployeeById(String username, Long employeeId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found."));

        if (!employee.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this employee.");
        }

        return employee;
    }

    // -------------------------------------------------------
    // INTERNAL: Get single employee (used by booking/sale)
    // -------------------------------------------------------
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found."));
    }

    // -------------------------------------------------------
    // PRIVATE HELPERS
    // -------------------------------------------------------
    private Employee buildEmployee(EmployeeDto dto, Dealer dealer) {
        Employee employee = new Employee();
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setPhone(dto.getPhone());
        employee.setEmail(dto.getEmail());
        employee.setDesignation(dto.getDesignation());
        employee.setDealer(dealer);
        employee.setStatus("ACTIVE");
        return employee;
    }

    private void validateUniqueFields(EmployeeDto dto, Long excludeId) {

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            employeeRepository.findByPhone(dto.getPhone()).ifPresent(existing -> {
                if (excludeId == null || !existing.getId().equals(excludeId)) {
                    throw new RuntimeException("An employee with this phone number already exists.");
                }
            });
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            employeeRepository.findByEmail(dto.getEmail()).ifPresent(existing -> {
                if (excludeId == null || !existing.getId().equals(excludeId)) {
                    throw new RuntimeException("An employee with this email already exists.");
                }
            });
        }
    }
}