package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // JWT Filter
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 🔥 IMPORTANT: Authentication Provider (used for login + locking)
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        // 🔥 This ensures locked accounts throw proper exception
        authProvider.setHideUserNotFoundExceptions(false);

        return authProvider;
    }

    // Authentication Manager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // Security Filter Chain
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(Arrays.asList("http://localhost:5174"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));
                return config;
            }))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()

                // Admin + Dealer shared read access
                .requestMatchers(HttpMethod.GET, "/api/admin/cars").hasAnyAuthority("ROLE_ADMIN", "ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/admin/colours").hasAnyAuthority("ROLE_ADMIN", "ROLE_DEALER")

                // Stock request and invoice endpoints
                .requestMatchers(HttpMethod.GET, "/api/admin/stock-requests/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/stock-requests/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/invoices/**").hasAuthority("ROLE_ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/dealer/stock-requests/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.POST, "/api/dealer/stock-requests/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/invoices/**").hasAuthority("ROLE_DEALER")

                // Dealer lead endpoints
                .requestMatchers(HttpMethod.POST, "/api/dealer/leads").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/leads").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.PUT, "/api/dealer/leads/**").hasAuthority("ROLE_DEALER")

                // Dealer booking endpoints
                .requestMatchers(HttpMethod.POST, "/api/dealer/bookings").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/bookings").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/bookings/**").hasAuthority("ROLE_DEALER")

                // Dealer sale endpoints
                .requestMatchers(HttpMethod.POST, "/api/dealer/sales").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/sales").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/sales/**").hasAuthority("ROLE_DEALER")

                // Dealer payment endpoints
                .requestMatchers(HttpMethod.GET, "/api/dealer/payments").hasAuthority("ROLE_DEALER")

                // 🔥 NEW: Employee endpoints (ADDED HERE)
                // Admin Employee APIs
                .requestMatchers(HttpMethod.POST, "/api/admin/employees").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/employees").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")

                // Dealer Employee APIs
                .requestMatchers(HttpMethod.POST, "/api/dealer/employees").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/employees").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.PUT, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.DELETE, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")

                // 🔥 NEW: Customer endpoints
                .requestMatchers(HttpMethod.GET, "/api/admin/customers/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/dealer/customers/**").hasAuthority("ROLE_DEALER")

                // Admin only write access + other admin endpoints
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // Catch-all dealer routes (kept LAST)
                .requestMatchers("/api/dealer/**").hasAuthority("ROLE_DEALER")

                .anyRequest().authenticated()
            );

        // 🔥 Register Authentication Provider (VERY IMPORTANT)
        http.authenticationProvider(authenticationProvider());

        // JWT Filter
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}