package com.example.demo.dto;

public class DealerDashboardStatsDto {

    private long todaySales;
    private double todayRevenue;
    private long monthSales;
    private double monthRevenue;
    private long activeBookings;
    private long openLeads;
    private long totalInventoryUnits;
    private long availableInventoryUnits;
    private long pendingStockRequests;
    private long totalEmployees;
    private long activeEmployees;

    // Getters and Setters

    public long getTodaySales() { return todaySales; }
    public void setTodaySales(long todaySales) { this.todaySales = todaySales; }

    public double getTodayRevenue() { return todayRevenue; }
    public void setTodayRevenue(double todayRevenue) { this.todayRevenue = todayRevenue; }

    public long getMonthSales() { return monthSales; }
    public void setMonthSales(long monthSales) { this.monthSales = monthSales; }

    public double getMonthRevenue() { return monthRevenue; }
    public void setMonthRevenue(double monthRevenue) { this.monthRevenue = monthRevenue; }

    public long getActiveBookings() { return activeBookings; }
    public void setActiveBookings(long activeBookings) { this.activeBookings = activeBookings; }

    public long getOpenLeads() { return openLeads; }
    public void setOpenLeads(long openLeads) { this.openLeads = openLeads; }

    public long getTotalInventoryUnits() { return totalInventoryUnits; }
    public void setTotalInventoryUnits(long totalInventoryUnits) { this.totalInventoryUnits = totalInventoryUnits; }

    public long getAvailableInventoryUnits() { return availableInventoryUnits; }
    public void setAvailableInventoryUnits(long availableInventoryUnits) { this.availableInventoryUnits = availableInventoryUnits; }

    public long getPendingStockRequests() { return pendingStockRequests; }
    public void setPendingStockRequests(long pendingStockRequests) { this.pendingStockRequests = pendingStockRequests; }

    public long getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(long totalEmployees) { this.totalEmployees = totalEmployees; }

    public long getActiveEmployees() { return activeEmployees; }
    public void setActiveEmployees(long activeEmployees) { this.activeEmployees = activeEmployees; }
}