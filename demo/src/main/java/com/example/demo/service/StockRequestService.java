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
    // ADMIN: Approve a request — with partial quantity support
    // -------------------------------------------------------
    @Transactional
    public SupplyInvoice approveRequest(Long requestId, Integer approvedQuantity) {

        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_PENDING)) {
            throw new RuntimeException("Only PENDING requests can be approved.");
        }

        // Validate approvedQuantity
        if (approvedQuantity == null || approvedQuantity <= 0) {
            throw new RuntimeException("Approved quantity must be greater than zero.");
        }
        if (approvedQuantity > request.getRequestedQuantity()) {
            throw new RuntimeException("Approved quantity cannot exceed requested quantity ("
                    + request.getRequestedQuantity() + ").");
        }

        boolean isPartial = approvedQuantity < request.getRequestedQuantity();

        // Set approved quantity on the current request
        request.setApprovedQuantity(approvedQuantity);
        request.setStatus(AppConstants.STOCK_REQUEST_APPROVED);
        stockRequestRepository.save(request);

        // If partial approval — create a new PENDING request for the remainder
        if (isPartial) {
            int remainder = request.getRequestedQuantity() - approvedQuantity;
            StockRequest remainderRequest = new StockRequest();
            remainderRequest.setDealer(request.getDealer());
            remainderRequest.setVariant(request.getVariant());
            remainderRequest.setColour(request.getColour());
            remainderRequest.setRequestedQuantity(remainder);
            remainderRequest.setStatus(AppConstants.STOCK_REQUEST_PENDING);
            remainderRequest.setNotes("Remaining " + remainder + " unit(s) from partial approval of request #" + requestId);
            stockRequestRepository.save(remainderRequest);
        }

        // Generate supply invoice (no inventory update yet — happens on DELIVERED)
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String dealerCode = request.getDealer().getDealerCode().replace("@", "");
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
        item.setQuantity(approvedQuantity); // approved qty, not requested
        supplyInvoiceItemRepository.save(item);

        auditLogService.log(
            "APPROVE_STOCK_REQUEST",
            "Stock request #" + requestId + " approved for " + approvedQuantity + " unit(s)"
            + (isPartial ? " (partial; " + (request.getRequestedQuantity() - approvedQuantity) + " remaining as new request)" : "")
            + ". Invoice: " + invoiceNumber
            + ". Dealer: " + request.getDealer().getName(),
            null
        );

        return savedInvoice;
    }

    // -------------------------------------------------------
    // ADMIN: Mark as Delivered — THIS is when inventory updates
    // -------------------------------------------------------
    @Transactional
    public SupplyInvoice deliverRequest(Long requestId) {
        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_APPROVED)) {
            throw new RuntimeException("Only APPROVED requests can be marked as Delivered.");
        }

        Integer qtyToAdd = request.getApprovedQuantity() != null
                ? request.getApprovedQuantity()
                : request.getRequestedQuantity();

        // NOW update inventory
        inventoryService.addStock(
                request.getDealer().getId(),
                request.getVariant().getId(),
                request.getColour().getId(),
                qtyToAdd
        );

        request.setStatus(AppConstants.STOCK_REQUEST_DELIVERED);
        stockRequestRepository.save(request);

        // Update invoice status
        SupplyInvoice invoice = supplyInvoiceRepository.findByStockRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for this request."));
        invoice.setStatus("DELIVERED");
        supplyInvoiceRepository.save(invoice);

        auditLogService.log(
            "DELIVER_STOCK_REQUEST",
            "Stock request #" + requestId + " delivered. " + qtyToAdd + " unit(s) added to inventory."
            + " Dealer: " + request.getDealer().getName(),
            null
        );

        return invoice;
    }

    // -------------------------------------------------------
    // ADMIN: Reject an APPROVED request (post-approval rejection)
    // -------------------------------------------------------
    @Transactional
    public StockRequest rejectApprovedRequest(Long requestId) {
        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_APPROVED)) {
            throw new RuntimeException("This action is only available for APPROVED requests.");
        }

        // Void the invoice
        supplyInvoiceRepository.findByStockRequestId(requestId).ifPresent(inv -> {
            inv.setStatus("VOIDED");
            supplyInvoiceRepository.save(inv);
        });

        request.setStatus(AppConstants.STOCK_REQUEST_REJECTED);
        StockRequest saved = stockRequestRepository.save(request);

        auditLogService.log(
            "REJECT_APPROVED_STOCK_REQUEST",
            "Approved stock request #" + requestId + " was rejected after approval."
            + " Dealer: " + request.getDealer().getName(),
            null
        );

        return saved;
    }

    // -------------------------------------------------------
    // ADMIN: Reject a PENDING request (original behavior)
    // -------------------------------------------------------
    @Transactional
    public StockRequest rejectRequest(Long requestId) {
        StockRequest request = stockRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Stock request not found."));

        if (!request.getStatus().equals(AppConstants.STOCK_REQUEST_PENDING)) {
            throw new RuntimeException("Only PENDING requests can be rejected via this action.");
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