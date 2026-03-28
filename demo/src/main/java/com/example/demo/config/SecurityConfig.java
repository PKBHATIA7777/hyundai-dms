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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/test/**").permitAll()

                // ── ADMIN DASHBOARD ──
                .requestMatchers(HttpMethod.GET, "/api/admin/dashboard/**").hasAuthority("ROLE_ADMIN")

                // ── DEALER DASHBOARD ──
                .requestMatchers(HttpMethod.GET, "/api/dealer/dashboard/**").hasAuthority("ROLE_DEALER")

                // ── SHARED READ (admin + dealer) ──
                .requestMatchers(HttpMethod.GET, "/api/admin/cars").hasAnyAuthority("ROLE_ADMIN", "ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/admin/colours").hasAnyAuthority("ROLE_ADMIN", "ROLE_DEALER")

                // ── ACCESSORIES ──
                .requestMatchers(HttpMethod.POST, "/api/admin/accessories").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/accessories").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/accessories/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/dealer/accessories").hasAuthority("ROLE_DEALER")

                // ── STOCK REQUESTS ──
                .requestMatchers(HttpMethod.GET, "/api/admin/stock-requests/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/stock-requests/**/dispatch").hasAuthority("ROLE_ADMIN") // ✅ NEW
                .requestMatchers(HttpMethod.PUT, "/api/admin/stock-requests/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/invoices/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/dealer/stock-requests/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.POST, "/api/dealer/stock-requests/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/invoices/**").hasAuthority("ROLE_DEALER")

                // ── LEADS ──
                .requestMatchers(HttpMethod.POST, "/api/dealer/leads").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/leads").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.PUT, "/api/dealer/leads/**").hasAuthority("ROLE_DEALER")

                // ── BOOKINGS ──
                .requestMatchers(HttpMethod.POST, "/api/dealer/bookings").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/bookings").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/bookings/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.PUT, "/api/dealer/bookings/**").hasAuthority("ROLE_DEALER")

                // ── SALES ──
                .requestMatchers(HttpMethod.POST, "/api/dealer/sales").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/sales").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/sales/**").hasAuthority("ROLE_DEALER")

                // ── PAYMENTS ──
                .requestMatchers(HttpMethod.GET, "/api/dealer/payments").hasAuthority("ROLE_DEALER")

                .requestMatchers(HttpMethod.GET, "/api/admin/audit-logs/**").hasAuthority("ROLE_ADMIN")

                // ── EMPLOYEES ──
                .requestMatchers(HttpMethod.POST, "/api/admin/employees").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/employees").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/admin/employees/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/dealer/employees").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/employees").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.GET, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.PUT, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")
                .requestMatchers(HttpMethod.DELETE, "/api/dealer/employees/**").hasAuthority("ROLE_DEALER")

                // ── CUSTOMERS ──
                .requestMatchers(HttpMethod.GET, "/api/admin/customers/by-dealer").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/admin/customers/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/dealer/customers/**").hasAuthority("ROLE_DEALER")

                // ── ADMIN CATCH-ALL ──
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                // ── DEALER CATCH-ALL ──
                .requestMatchers("/api/dealer/**").hasAuthority("ROLE_DEALER")

                .anyRequest().authenticated()
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}