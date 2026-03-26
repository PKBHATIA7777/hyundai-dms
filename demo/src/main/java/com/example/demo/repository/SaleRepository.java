package com.example.demo.repository;

import com.example.demo.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByDealerIdOrderBySaleDateDesc(Long dealerId);

    List<Sale> findByDealerIdAndSaleStatusOrderBySaleDateDesc(Long dealerId, String saleStatus);

    boolean existsByBookingId(Long bookingId);

    Optional<Sale> findByBookingId(Long bookingId);

    // ── ADMIN DASHBOARD QUERIES ──

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleStatus = 'COMPLETED'")
    long countCompletedSales();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleStatus = 'COMPLETED'")
    double sumTotalRevenue();

    @Query("SELECT s FROM Sale s WHERE s.saleStatus = 'COMPLETED' ORDER BY s.saleDate DESC")
    List<Sale> findRecentSales();

    @Query("SELECT YEAR(s.saleDate) as yr, MONTH(s.saleDate) as mo, " +
           "COUNT(s) as cnt, COALESCE(SUM(s.totalAmount), 0) as rev " +
           "FROM Sale s WHERE s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :fromDate " +
           "GROUP BY YEAR(s.saleDate), MONTH(s.saleDate) " +
           "ORDER BY yr ASC, mo ASC")
    List<Object[]> findMonthlyRevenue(@Param("fromDate") LocalDateTime fromDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.dealer.id = :dealerId AND s.saleStatus = 'COMPLETED'")
    long countByDealerId(@Param("dealerId") Long dealerId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.dealer.id = :dealerId AND s.saleStatus = 'COMPLETED'")
    double sumRevenueByDealerId(@Param("dealerId") Long dealerId);

    // ── DEALER DASHBOARD QUERIES ──

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.dealer.id = :dealerId " +
           "AND s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :startOfDay AND s.saleDate <= :endOfDay")
    long countTodaySalesByDealer(
        @Param("dealerId") Long dealerId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.dealer.id = :dealerId " +
           "AND s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :startOfDay AND s.saleDate <= :endOfDay")
    double sumTodayRevenueByDealer(
        @Param("dealerId") Long dealerId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.dealer.id = :dealerId " +
           "AND s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :startOfMonth")
    long countMonthSalesByDealer(
        @Param("dealerId") Long dealerId,
        @Param("startOfMonth") LocalDateTime startOfMonth
    );

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.dealer.id = :dealerId " +
           "AND s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :startOfMonth")
    double sumMonthRevenueByDealer(
        @Param("dealerId") Long dealerId,
        @Param("startOfMonth") LocalDateTime startOfMonth
    );

    @Query("SELECT s FROM Sale s WHERE s.dealer.id = :dealerId " +
           "AND s.saleStatus = 'COMPLETED' " +
           "ORDER BY s.saleDate DESC")
    List<Sale> findRecentSalesByDealer(@Param("dealerId") Long dealerId);

    // ── DEALER WEEKLY SALES (for chart) ──
    @Query("SELECT YEAR(s.saleDate) as yr, MONTH(s.saleDate) as mo, " +
           "COUNT(s) as cnt, COALESCE(SUM(s.totalAmount), 0) as rev " +
           "FROM Sale s WHERE s.dealer.id = :dealerId AND s.saleStatus = 'COMPLETED' " +
           "AND s.saleDate >= :fromDate " +
           "GROUP BY YEAR(s.saleDate), MONTH(s.saleDate) " +
           "ORDER BY yr ASC, mo ASC")
    List<Object[]> findMonthlyRevenueByDealer(
        @Param("dealerId") Long dealerId,
        @Param("fromDate") LocalDateTime fromDate
    );
}