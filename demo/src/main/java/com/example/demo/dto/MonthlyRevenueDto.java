package com.example.demo.dto;

public class MonthlyRevenueDto {

    private int year;
    private int month;
    private String monthName;
    private long salesCount;
    private double revenue;

    public MonthlyRevenueDto(int year, int month, long salesCount, double revenue) {
        this.year = year;
        this.month = month;
        this.salesCount = salesCount;
        this.revenue = revenue;
        this.monthName = getMonthName(month);
    }

    private String getMonthName(int month) {
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun",
                           "Jul","Aug","Sep","Oct","Nov","Dec"};
        if (month >= 1 && month <= 12) {
            return months[month - 1];
        }
        return "Unknown";
    }

    public int getYear() { return year; }
    public int getMonth() { return month; }
    public String getMonthName() { return monthName; }
    public long getSalesCount() { return salesCount; }
    public double getRevenue() { return revenue; }
}