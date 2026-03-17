package com.example.demo;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin user already exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                // Find the ROLE_ADMIN we just inserted in Step 1
                Role adminRole = roleRepository.findByName("ROLE_ADMIN");
                
                if (adminRole != null) {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setPassword(passwordEncoder.encode("admin123")); // Securely encoding
                    admin.setEmail("admin@hyundai.com");
                    admin.setRole(adminRole);
                    admin.setAccountNonLocked(true);
                    admin.setFailedAttempts(0);

                    userRepository.save(admin);
                    System.out.println(">>> Bootstrap: Default Admin user created (admin / admin123)");
                } else {
                    System.err.println(">>> Bootstrap Error: ROLE_ADMIN not found. Check Step 1 SQL.");
                }
            }
        };
    }
}
 