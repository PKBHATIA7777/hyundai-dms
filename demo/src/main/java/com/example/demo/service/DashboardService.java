package com.example.demo.service;

import com.example.demo.dto.AdminDashboardStatsDto;
import com.example.demo.dto.DealerDashboardStatsDto;
import com.example.demo.dto.DealerPerformanceDto;
import com.example.demo.dto.MonthlyRevenueDto;
import com.example.demo.entity.Dealer;
import com.example.demo.entity.Sale;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @Autowired private SaleRepository saleRepository;
    @Autowired private DealerRepository dealerRepository;
    @Autowired private CarRepository carRepository;
    @Autowired private VariantRepository variantRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private LeadRepository leadRepository;
    @Autowired private StockRequestRepository stockRequestRepository;
    @Autowired private DealerInventoryRepository inventoryRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private UserRepository userRepository;

    // ─────────────────────────────────────────────
    // ADMIN DASHBOARD
    // ─────────────────────────────────────────────

    public AdminDashboardStatsDto getAdminStats() {

        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        long totalDealers = dealerRepository.count();
        long activeDealers = dealerRepository.findAll()
                .stream().filter(d -> "ACTIVE".equals(d.getStatus())).count();

        stats.setTotalDealers(totalDealers);
        stats.setActiveDealers(activeDealers);
        stats.setInactiveDealers(totalDealers - activeDealers);
        stats.setTotalCars(carRepository.count());
        stats.setTotalVariants(variantRepository.count());
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalSales(saleRepository.countCompletedSales());
        stats.setTotalRevenue(saleRepository.sumTotalRevenue());
        stats.setPendingStockRequests(stockRequestRepository.countPendingRequests());
        stats.setTotalBookings(bookingRepository.count());
        stats.setConvertedBookings(
            bookingRepository.findAll().stream()
                .filter(b -> "CONVERTED".equals(b.getBookingStatus())).count()
        );
        stats.setConfirmedBookings(
            bookingRepository.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getBookingStatus())).count()
        );
        stats.setTotalLeads(leadRepository.count());
        stats.setTotalEmployees(employeeRepository.count());

        return stats;
    }

    public List<DealerPerformanceDto> getDealerPerformance() {
        List<Dealer> dealers = dealerRepository.findAll();
        List<DealerPerformanceDto> result = new ArrayList<>();

        for (Dealer dealer : dealers) {
            DealerPerformanceDto dto = new DealerPerformanceDto();
            dto.setDealerId(dealer.getId());
            dto.setDealerName(dealer.getName());
            dto.setDealerCode(dealer.getDealerCode());
            dto.setCity(dealer.getCity());
            dto.setStatus(dealer.getStatus());
            dto.setTotalSales(saleRepository.countByDealerId(dealer.getId()));
            dto.setTotalRevenue(saleRepository.sumRevenueByDealerId(dealer.getId()));
            dto.setTotalBookings(bookingRepository.countAllByDealer(dealer.getId()));
            dto.setConfirmedBookings(
                bookingRepository.countByDealerAndStatus(dealer.getId(), "CONFIRMED")
            );
            dto.setTotalLeads(leadRepository.countAllByDealer(dealer.getId()));
            dto.setAvailableInventory(
                inventoryRepository.sumAvailableStockByDealer(dealer.getId())
            );
            result.add(dto);
        }

        result.sort((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue()));
        return result;
    }

    public List<MonthlyRevenueDto> getAdminMonthlyRevenue() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6).withDayOfMonth(1)
                .with(LocalTime.MIDNIGHT);

        List<Object[]> raw = saleRepository.findMonthlyRevenue(sixMonthsAgo);
        List<MonthlyRevenueDto> result = new ArrayList<>();

        for (Object[] row : raw) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long count  = ((Number) row[2]).longValue();
            double rev  = ((Number) row[3]).doubleValue();
            result.add(new MonthlyRevenueDto(year, month, count, rev));
        }

        return result;
    }

    public List<Sale> getAdminRecentSales(int limit) {
        List<Sale> all = saleRepository.findRecentSales();
        return all.size() > limit ? all.subList(0, limit) : all;
    }

    // ─────────────────────────────────────────────
    // DEALER DASHBOARD
    // ─────────────────────────────────────────────

    public DealerDashboardStatsDto getDealerStats(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Long dealerId = user.getDealer().getId();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        DealerDashboardStatsDto stats = new DealerDashboardStatsDto();

        stats.setTodaySales(
            saleRepository.countTodaySalesByDealer(dealerId, startOfDay, endOfDay)
        );
        stats.setTodayRevenue(
            saleRepository.sumTodayRevenueByDealer(dealerId, startOfDay, endOfDay)
        );
        stats.setMonthSales(
            saleRepository.countMonthSalesByDealer(dealerId, startOfMonth)
        );
        stats.setMonthRevenue(
            saleRepository.sumMonthRevenueByDealer(dealerId, startOfMonth)
        );
        stats.setActiveBookings(
            bookingRepository.countActiveBookingsByDealer(dealerId)
        );
        stats.setOpenLeads(
            leadRepository.countOpenLeadsByDealer(dealerId)
        );
        stats.setTotalInventoryUnits(
            inventoryRepository.sumTotalStockByDealer(dealerId)
        );
        stats.setAvailableInventoryUnits(
            inventoryRepository.sumAvailableStockByDealer(dealerId)
        );
        stats.setPendingStockRequests(
            stockRequestRepository.countPendingByDealer(dealerId)
        );
        stats.setTotalEmployees(
            employeeRepository.findByDealerId(dealerId).size()
        );
        stats.setActiveEmployees(
            employeeRepository.findByDealerIdAndStatus(dealerId, "ACTIVE").size()
        );

        return stats;
    }

    public List<MonthlyRevenueDto> getDealerMonthlyRevenue(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Long dealerId = user.getDealer().getId();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6)
                .withDayOfMonth(1).with(LocalTime.MIDNIGHT);

        List<Object[]> raw = saleRepository.findMonthlyRevenueByDealer(dealerId, sixMonthsAgo);
        List<MonthlyRevenueDto> result = new ArrayList<>();

        for (Object[] row : raw) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long count  = ((Number) row[2]).longValue();
            double rev  = ((Number) row[3]).doubleValue();
            result.add(new MonthlyRevenueDto(year, month, count, rev));
        }

        return result;
    }

    public List<Sale> getDealerRecentSales(String username, int limit) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        List<Sale> all = saleRepository.findRecentSalesByDealer(user.getDealer().getId());
        return all.size() > limit ? all.subList(0, limit) : all;
    }
}