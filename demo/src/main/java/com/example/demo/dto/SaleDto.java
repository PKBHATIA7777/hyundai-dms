package com.example.demo.dto;

public class SaleDto {

    // The booking being converted to a sale
    // This is the only required field
    private Long bookingId;

    // Remaining amount paid now
    // If zero — full payment was already done via advance
    private Double remainingAmount;

    // Cash / Card / UPI / Loan
    private String paymentMode;

    // Loan details — only required if paymentMode is Loan
    private String loanBank;
    private String loanReferenceNumber;

    // Optional notes
    private String notes;

    // Getters and Setters

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public Double getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(Double remainingAmount) { this.remainingAmount = remainingAmount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getLoanBank() { return loanBank; }
    public void setLoanBank(String loanBank) { this.loanBank = loanBank; }

    public String getLoanReferenceNumber() { return loanReferenceNumber; }
    public void setLoanReferenceNumber(String loanReferenceNumber) {
        this.loanReferenceNumber = loanReferenceNumber;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
