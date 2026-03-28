package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "supply_invoices")
public class SupplyInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @OneToOne
    @JoinColumn(name = "stock_request_id", nullable = false)
    private StockRequest stockRequest;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    private LocalDateTime invoiceDate = LocalDateTime.now();

    @Column(nullable = false)
    private String status = "GENERATED";

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"invoice", "hibernateLazyInitializer", "handler"})
    private List<SupplyInvoiceItem> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Dealer getDealer() { return dealer; }
    public void setDealer(Dealer dealer) { this.dealer = dealer; }

    public StockRequest getStockRequest() { return stockRequest; }
    public void setStockRequest(StockRequest stockRequest) { this.stockRequest = stockRequest; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public LocalDateTime getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<SupplyInvoiceItem> getItems() { return items; }
    public void setItems(List<SupplyInvoiceItem> items) { this.items = items; }
}