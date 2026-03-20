package com.example.demo.dto;

public class AddStockDto {

    private Long dealerId;
    private Long variantId;
    private Long colourId;
    private int quantity;

    public Long getDealerId() { return dealerId; }
    public void setDealerId(Long dealerId) { this.dealerId = dealerId; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Long getColourId() { return colourId; }
    public void setColourId(Long colourId) { this.colourId = colourId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}