package com.example.demo.dto;

public class DealerPerformanceDto {

    private Long dealerId;
    private String dealerName;
    private String dealerCode;
    private String city;
    private String status;
    private long totalSales;
    private double totalRevenue;
    private long totalBookings;
    private long confirmedBookings;
    private long totalLeads;
    private long availableInventory;

    // Getters and Setters

    public Long getDealerId() { return dealerId; }
    public void setDealerId(Long dealerId) { this.dealerId = dealerId; }

    public String getDealerName() { return dealerName; }
    public void setDealerName(String dealerName) { this.dealerName = dealerName; }

    public String getDealerCode() { return dealerCode; }
    public void setDealerCode(String dealerCode) { this.dealerCode = dealerCode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getTotalSales() { return totalSales; }
    public void setTotalSales(long totalSales) { this.totalSales = totalSales; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

    public long getTotalLeads() { return totalLeads; }
    public void setTotalLeads(long totalLeads) { this.totalLeads = totalLeads; }

    public long getAvailableInventory() { return availableInventory; }
    public void setAvailableInventory(long availableInventory) { this.availableInventory = availableInventory; }
}