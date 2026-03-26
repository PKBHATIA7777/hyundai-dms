package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Sale;
import com.example.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ─────────────────────────────────────────────
    // ADMIN ENDPOINTS
    // ─────────────────────────────────────────────

    @GetMapping("/admin/dashboard/stats")
    public ResponseEntity<?> getAdminStats() {
        try {
            AdminDashboardStatsDto stats = dashboardService.getAdminStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/dashboard/dealer-performance")
    public ResponseEntity<?> getDealerPerformance() {
        try {
            List<DealerPerformanceDto> performance = dashboardService.getDealerPerformance();
            return ResponseEntity.ok(ApiResponse.success(performance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/dashboard/monthly-revenue")
    public ResponseEntity<?> getAdminMonthlyRevenue() {
        try {
            List<MonthlyRevenueDto> revenue = dashboardService.getAdminMonthlyRevenue();
            return ResponseEntity.ok(ApiResponse.success(revenue));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/admin/dashboard/recent-sales")
    public ResponseEntity<?> getAdminRecentSales(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Sale> sales = dashboardService.getAdminRecentSales(limit);
            return ResponseEntity.ok(ApiResponse.success(sales));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────
    // DEALER ENDPOINTS
    // ─────────────────────────────────────────────

    @GetMapping("/dealer/dashboard/stats")
    public ResponseEntity<?> getDealerStats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            DealerDashboardStatsDto stats = dashboardService.getDealerStats(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dealer/dashboard/monthly-revenue")
    public ResponseEntity<?> getDealerMonthlyRevenue() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<MonthlyRevenueDto> revenue = dashboardService.getDealerMonthlyRevenue(auth.getName());
            return ResponseEntity.ok(ApiResponse.success(revenue));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/dealer/dashboard/recent-sales")
    public ResponseEntity<?> getDealerRecentSales(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            List<Sale> sales = dashboardService.getDealerRecentSales(auth.getName(), limit);
            return ResponseEntity.ok(ApiResponse.success(sales));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}