package com.example.demo.service;

import com.example.demo.dto.StockRequestDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class StockRequestService {

    @Autowired
    private StockRequestRepository stockRequestRepository;

    @Autowired
    private DealerRepository dealerRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private ColourRepository colourRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplyInvoiceRepository supplyInvoiceRepository;

    @Autowired
    private SupplyInvoiceItemRepository supplyInvoiceItemRepository;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private AuditLogService auditLogService;

    // -------------------------------------------------------
    // DEALER: Create a new stock request
    // -------------------------------------------------------
    @Transactional
    public StockRequest createRequest(String username, StockRequestDto dto) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Dealer dealer = user.getDealer();

        Variant variant = variantRepository.findById(dto.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found."));

        Colour colour = colourRepository.findById(dto.getColourId())
                .orElseThrow(() -> new RuntimeException("Colour not found."));

        if (dto.getRequestedQuantity() == null || dto.getRequestedQuantity() <= 0) {
            throw new RuntimeException("Requested quantity must be greater than zero.");
        }

        StockRequest request = new StockRequest();
        request.setDealer(dealer);
        request.setVariant(variant);
        request.setColour(colour);
        request.setRequestedQuantity(dto.getRequestedQuantity());
        request.setNotes(dto.getNotes());
        request.setStatus(AppConstants.STOCK_REQUEST_PENDING);

        return stockRequestRepository.save(request);
    }

    // -------------------------------------------------------
    // DEALER: Get their own requests (UPDATED - sorted by latest first)
    // -------------------------------------------------------
    public List<StockRequest> getMyRequests(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return stockRequestRepository.findByDealerIdOrderByRequestDateDesc(
                user.getDealer().getId()
        );
    }

    // -------------------------------------------------------
    // ADMIN: Get all stock requests (UPDATED - sorted by latest first)
    // -------------------------------------------------------
    public List<StockRequest> getAllRequests() {
        return stockRequestRepository.findAllByOrderByRequestDateDesc();
    }

    // -------------------------------------------------------
    // ADMIN: Approve a request
    // -------------------------------------------------------
    @Transactional
    public SupplyInvoice approveRequest(Long requestId) {

        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_PENDING)) {
            throw new RuntimeException("Only PENDING requests can be approved.");
        }

        request.setStatus(AppConstants.STOCK_REQUEST_APPROVED);
        stockRequestRepository.save(request);

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String dealerCode = request.getDealer().getDealerCode()
                .replace("@", "");
        String invoiceNumber = "INV-" + dealerCode + "-" + timestamp;

        SupplyInvoice invoice = new SupplyInvoice();
        invoice.setDealer(request.getDealer());
        invoice.setStockRequest(request);
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setStatus("GENERATED");
        SupplyInvoice savedInvoice = supplyInvoiceRepository.save(invoice);

        SupplyInvoiceItem item = new SupplyInvoiceItem();
        item.setInvoice(savedInvoice);
        item.setVariant(request.getVariant());
        item.setColour(request.getColour());
        item.setQuantity(request.getRequestedQuantity());
        supplyInvoiceItemRepository.save(item);

        inventoryService.addStock(
                request.getDealer().getId(),
                request.getVariant().getId(),
                request.getColour().getId(),
                request.getRequestedQuantity()
        );

        auditLogService.log(
            "APPROVE_STOCK_REQUEST",
            "Stock request #" + requestId + " approved. Invoice: " + invoiceNumber
            + ". Dealer: " + request.getDealer().getName(),
            null
        );

        return savedInvoice;
    }

    // -------------------------------------------------------
    // ADMIN: Dispatch a request
    // -------------------------------------------------------
    @Transactional
    public SupplyInvoice dispatchRequest(Long requestId) {
        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_APPROVED)) {
            throw new RuntimeException("Only APPROVED requests can be dispatched.");
        }

        request.setStatus("DISPATCHED");
        stockRequestRepository.save(request);

        return supplyInvoiceRepository.findByStockRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for this request."));
    }

    // -------------------------------------------------------
    // ADMIN: Reject a request
    // -------------------------------------------------------
    @Transactional
    public StockRequest rejectRequest(Long requestId) {

        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_PENDING)) {
            throw new RuntimeException("Only PENDING requests can be rejected.");
        }

        auditLogService.log(
            "REJECT_STOCK_REQUEST",
            "Stock request #" + requestId + " rejected. Dealer: " + request.getDealer().getName(),
            null
        );

        request.setStatus(AppConstants.STOCK_REQUEST_REJECTED);
        return stockRequestRepository.save(request);
    }

    // -------------------------------------------------------
    // ADMIN: Get all invoices
    // -------------------------------------------------------
    public List<SupplyInvoice> getAllInvoices() {
        return supplyInvoiceRepository.findAll();
    }

    // -------------------------------------------------------
    // DEALER: Get their own invoices
    // -------------------------------------------------------
    public List<SupplyInvoice> getMyInvoices(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return supplyInvoiceRepository.findByDealerId(user.getDealer().getId());
    }
}