package com.example.demo.dto;

import java.util.List;

public class SaleDto {

    // Required — the booking being converted
    private Long bookingId;

    // Remaining amount paid now (0 if fully covered by advance)
    private Double remainingAmount;

    // Cash / Card / UPI / Loan
    private String paymentMode;

    // Loan details — only required if paymentMode is Loan
    private String loanBank;
    private String loanReferenceNumber;

    // Optional employee who handled this sale
    private Long employeeId;

    // Optional accessories added to this sale
    private List<SaleItemDto> accessories;

    // Optional insurance details
    private InsuranceDto insurance;

    // Optional notes
    private String notes;

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

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public List<SaleItemDto> getAccessories() { return accessories; }
    public void setAccessories(List<SaleItemDto> accessories) { this.accessories = accessories; }

    public InsuranceDto getInsurance() { return insurance; }
    public void setInsurance(InsuranceDto insurance) { this.insurance = insurance; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}