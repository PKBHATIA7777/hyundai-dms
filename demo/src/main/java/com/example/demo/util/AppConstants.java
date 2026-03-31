package com.example.demo.util;

public class AppConstants {
    // Dealer
    public static final String DEALER_ACTIVE = "ACTIVE";
    public static final String DEALER_INACTIVE = "INACTIVE";

    // Stock Request
    public static final String STOCK_REQUEST_PENDING = "PENDING";
    public static final String STOCK_REQUEST_APPROVED = "APPROVED";
    public static final String STOCK_REQUEST_REJECTED = "REJECTED";
    public static final String STOCK_REQUEST_DISPATCHED = "DISPATCHED"; // keep for backward compat
    public static final String STOCK_REQUEST_DELIVERED  = "DELIVERED";

    // Booking
    public static final String BOOKING_PENDING = "PENDING";
    public static final String BOOKING_CONFIRMED = "CONFIRMED";
    public static final String BOOKING_CANCELLED = "CANCELLED";
    public static final String BOOKING_CONVERTED = "CONVERTED";

    // Lead
    public static final String LEAD_NEW = "NEW";
    public static final String LEAD_CONTACTED = "CONTACTED";
    public static final String LEAD_INTERESTED = "INTERESTED";
    public static final String LEAD_BOOKED = "BOOKED";
    public static final String LEAD_LOST = "LOST";

    // Sale
    public static final String SALE_COMPLETED = "COMPLETED";
    public static final String SALE_CANCELLED = "CANCELLED";

    // Payment Type
    public static final String PAYMENT_ADVANCE = "ADVANCE";
    public static final String PAYMENT_REMAINING = "REMAINING";
    public static final String PAYMENT_LOAN = "LOAN";

    // Payment Mode
    public static final String PAYMENT_MODE_CASH = "Cash";
    public static final String PAYMENT_MODE_CARD = "Card";
    public static final String PAYMENT_MODE_UPI = "UPI";
    public static final String PAYMENT_MODE_LOAN = "Loan";
}