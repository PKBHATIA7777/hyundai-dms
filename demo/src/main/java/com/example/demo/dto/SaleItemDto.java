package com.example.demo.dto;

public class SaleItemDto {

    private Long accessoryId;
    private Integer quantity; // defaults to 1 if not provided

    public Long getAccessoryId() { return accessoryId; }
    public void setAccessoryId(Long accessoryId) { this.accessoryId = accessoryId; }

    public Integer getQuantity() { return quantity != null ? quantity : 1; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
