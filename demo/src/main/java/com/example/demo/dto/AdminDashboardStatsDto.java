package com.example.demo.dto;

public class AdminDashboardStatsDto {

    private long totalDealers;
    private long activeDealers;
    private long inactiveDealers;
    private long totalCars;
    private long totalVariants;
    private long totalCustomers;
    private long totalSales;
    private double totalRevenue;
    private long pendingStockRequests;
    private long totalBookings;
    private long confirmedBookings;
    private long convertedBookings;
    private long totalLeads;
    private long totalEmployees;

    // Getters and Setters

    public long getTotalDealers() { return totalDealers; }
    public void setTotalDealers(long totalDealers) { this.totalDealers = totalDealers; }

    public long getActiveDealers() { return activeDealers; }
    public void setActiveDealers(long activeDealers) { this.activeDealers = activeDealers; }

    public long getInactiveDealers() { return inactiveDealers; }
    public void setInactiveDealers(long inactiveDealers) { this.inactiveDealers = inactiveDealers; }

    public long getTotalCars() { return totalCars; }
    public void setTotalCars(long totalCars) { this.totalCars = totalCars; }

    public long getTotalVariants() { return totalVariants; }
    public void setTotalVariants(long totalVariants) { this.totalVariants = totalVariants; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getTotalSales() { return totalSales; }
    public void setTotalSales(long totalSales) { this.totalSales = totalSales; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getPendingStockRequests() { return pendingStockRequests; }
    public void setPendingStockRequests(long pendingStockRequests) { this.pendingStockRequests = pendingStockRequests; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

    public long getConvertedBookings() { return convertedBookings; }
    public void setConvertedBookings(long convertedBookings) { this.convertedBookings = convertedBookings; }

    public long getTotalLeads() { return totalLeads; }
    public void setTotalLeads(long totalLeads) { this.totalLeads = totalLeads; }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }
}