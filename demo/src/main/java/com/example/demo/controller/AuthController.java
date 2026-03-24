package com.example.demo.controller;

import com.example.demo.config.UserDetailsImpl;
import com.example.demo.config.UserDetailsServiceImpl;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid username or password.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            userDetailsService.resetFailedAttempts(loginRequest.getUsername());

            String jwt = jwtUtils.generateJwtToken(authentication);
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            // Get dealer status if dealer
            String dealerStatus = null;
            if (user.getDealer() != null) {
                dealerStatus = user.getDealer().getStatus();
            }

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    role,
                    dealerStatus
            ));

        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.LOCKED)
                    .body("Error: Account locked due to 5 failed attempts. Try again later.");

        } catch (BadCredentialsException e) {
            userDetailsService.increaseFailedAttempts(user);
            int remaining = 5 - user.getFailedAttempts();
            if (remaining <= 0) {
                return ResponseEntity.status(HttpStatus.LOCKED)
                        .body("Error: Account is now locked due to 5 failed attempts.");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid password. " + remaining + " attempts remaining.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // JWT is stateless — we clear the security context on the server side
        // The client is responsible for discarding the token
        SecurityContextHolder.clearContext();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully.");
        return ResponseEntity.ok(response);
    }
}