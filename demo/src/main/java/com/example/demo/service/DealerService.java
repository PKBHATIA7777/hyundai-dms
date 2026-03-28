package com.example.demo.service;

import com.example.demo.dto.DealerDto;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.DealerRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class DealerService {

    @Autowired
    private DealerRepository dealerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ Added AuditLogService
    @Autowired
    private AuditLogService auditLogService;

    // Generate dealer code like HC@101
    private String generateDealerCode(String name) {
        String[] words = name.trim().split("\\s+");
        String prefix;

        if (words.length == 1) {
            prefix = String.valueOf(words[0].charAt(0)).toUpperCase();
        } else {
            StringBuilder sb = new StringBuilder();
            for (String word : words) {
                sb.append(Character.toUpperCase(word.charAt(0)));
            }
            prefix = sb.toString();
        }

        long count = dealerRepository.count();
        long serial = 101 + count;

        return prefix + "@" + serial;
    }

    // Generate 6 digit numeric password
    private String generatePassword() {
        Random random = new Random();
        int password = 100000 + random.nextInt(900000);
        return String.valueOf(password);
    }

    @Transactional
    public Map<String, Object> createDealer(DealerDto dto) {
        // Check unique dealer name
        boolean nameExists = dealerRepository.existsByNameIgnoreCase(dto.getName());
        if (nameExists) {
            throw new RuntimeException("Dealer with this name already exists.");
        }

        // Check unique email
        boolean emailExists = userRepository.existsByEmail(dto.getEmail());
        if (emailExists) {
            throw new RuntimeException("A user with this email already exists.");
        }

        // Create dealer
        Dealer dealer = new Dealer();
        dealer.setName(dto.getName());
        dealer.setCity(dto.getCity());
        dealer.setContactNumber(dto.getContactNumber());
        dealer.setAddress(dto.getAddress());

        String dealerCode = generateDealerCode(dto.getName());
        dealer.setDealerCode(dealerCode);

        // ✅ Explicit guard — never rely on DB default alone
        dealer.setStatus("ACTIVE");

        Dealer savedDealer = dealerRepository.save(dealer);

        // Generate password
        String rawPassword = generatePassword();

        // Get ROLE_DEALER
        Role dealerRole = roleRepository.findByName("ROLE_DEALER");
        if (dealerRole == null) {
            throw new RuntimeException("ROLE_DEALER not found. Please insert it in the roles table.");
        }

        // Create user with dealer code as username
        User user = new User();
        user.setUsername(dealerCode);
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(dealerRole);
        user.setDealer(savedDealer);
        user.setAccountNonLocked(true);
        user.setFailedAttempts(0);

        userRepository.save(user);

        // Return dealer info + raw password to admin
        Map<String, Object> response = new HashMap<>();
        response.put("dealer", savedDealer);
        response.put("username", dealerCode);
        response.put("generatedPassword", rawPassword);
        response.put("message", "Dealer and user account created successfully.");

        // ✅ Audit log
        auditLogService.log(
                "CREATE_DEALER",
                "Dealer created: " + savedDealer.getName() + " (" + dealerCode + ")",
                null
        );

        return response;
    }

    public List<Dealer> getAllDealers() {
        return dealerRepository.findAll();
    }

    @Transactional
    public Dealer updateDealer(Long id, DealerDto dto) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        if (!dealer.getName().equalsIgnoreCase(dto.getName())) {
            boolean exists = dealerRepository.existsByNameIgnoreCase(dto.getName());
            if (exists) {
                throw new RuntimeException("Dealer with this name already exists.");
            }
            dealer.setName(dto.getName());
        }

        dealer.setCity(dto.getCity());
        dealer.setContactNumber(dto.getContactNumber());
        dealer.setAddress(dto.getAddress());

        return dealerRepository.save(dealer);
    }

    @Transactional
    public Map<String, Object> resetDealerPassword(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        User user = userRepository.findByDealerId(dealer.getId())
                .orElseThrow(() -> new RuntimeException("User for this dealer not found."));

        String rawPassword = generatePassword();
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password reset successfully.");
        response.put("newPassword", rawPassword);
        return response;
    }

    @Transactional
    public Dealer deactivateDealer(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        dealer.setStatus("INACTIVE");
        dealerRepository.save(dealer);

        // ✅ Audit log
        auditLogService.log(
                "DEACTIVATE_DEALER",
                "Dealer deactivated: " + dealer.getName() + " (" + dealer.getDealerCode() + ")",
                null
        );

        return dealer;
    }

    @Transactional
    public Dealer activateDealer(Long id) {
        Dealer dealer = dealerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dealer not found."));

        dealer.setStatus("ACTIVE");
        dealerRepository.save(dealer);

        // ✅ Audit log
        auditLogService.log(
                "ACTIVATE_DEALER",
                "Dealer activated: " + dealer.getName() + " (" + dealer.getDealerCode() + ")",
                null
        );

        return dealer;
    }
}