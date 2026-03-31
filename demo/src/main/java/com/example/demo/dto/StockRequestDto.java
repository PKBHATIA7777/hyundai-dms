package com.example.demo.dto;

public class StockRequestDto {

    private Long variantId;
    private Long colourId;
    private Integer requestedQuantity;

    // ✅ NEW FIELD
    private Integer approvedQuantity;

    private String notes;

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Long getColourId() { return colourId; }
    public void setColourId(Long colourId) { this.colourId = colourId; }

    public Integer getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(Integer requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    // ✅ NEW GETTER & SETTER
    public Integer getApprovedQuantity() { return approvedQuantity; }
    public void setApprovedQuantity(Integer approvedQuantity) { this.approvedQuantity = approvedQuantity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}