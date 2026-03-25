package com.example.demo.dto;

public class BookingDto {

    // Customer details — reuse existing or create new
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String address;
    private String panNumber;

    // Car details
    private Long variantId;
    private Long colourId;

    // Booking details
    private Double advanceAmount;
    private String paymentMode;  // Cash / Card / UPI / Loan
    private String notes;

    // Lead ID — optional, only if booking comes from a lead
    private Long leadId;

    // Getters and Setters

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Long getColourId() { return colourId; }
    public void setColourId(Long colourId) { this.colourId = colourId; }

    public Double getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(Double advanceAmount) { this.advanceAmount = advanceAmount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
}