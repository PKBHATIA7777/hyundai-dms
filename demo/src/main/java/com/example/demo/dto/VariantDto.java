package com.example.demo.dto;

import java.math.BigDecimal;

public class VariantDto {
    private String variantName;
    private BigDecimal price;

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}