package com.example.demo.service;

import com.example.demo.dto.SaleDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryService inventoryService;

    // -------------------------------------------------------
    // DEALER: Create a sale from a confirmed booking
    // This is the most critical method in Day 8
    //
    // Steps inside this transaction:
    // 1. Validate dealer from logged in user
    // 2. Validate booking belongs to this dealer
    // 3. Check booking is CONFIRMED and not already sold
    // 4. Validate remaining amount
    // 5. Create the Sale record
    // 6. Create ADVANCE payment record (from booking)
    // 7. Create REMAINING payment record (paid now)
    // 8. Reduce inventory (stock - 1, reserved - 1)
    // 9. Mark booking as CONVERTED
    //
    // If ANY step fails — entire transaction rolls back
    // -------------------------------------------------------
    @Transactional
    public Sale createSale(String username, SaleDto dto) {

        // Step 1: Get dealer from logged in user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Dealer dealer = user.getDealer();

        // Step 2: Validate bookingId is provided
        if (dto.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required.");
        }

        // Step 3: Find the booking
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        // Step 4: Make sure this booking belongs to this dealer
        if (!booking.getDealer().getId().equals(dealer.getId())) {
            throw new RuntimeException("This booking does not belong to your dealership.");
        }

        // Step 5: Only CONFIRMED bookings can be converted to sales
        if (!booking.getBookingStatus().equals(AppConstants.BOOKING_CONFIRMED)) {
            throw new RuntimeException(
                "Only CONFIRMED bookings can be converted to a sale. " +
                "Current status: " + booking.getBookingStatus()
            );
        }

        // Step 6: Prevent double selling the same booking
        if (saleRepository.existsByBookingId(booking.getId())) {
            throw new RuntimeException("A sale already exists for this booking.");
        }

        // Step 7: Validate remaining amount
        if (dto.getRemainingAmount() == null || dto.getRemainingAmount() < 0) {
            throw new RuntimeException("Remaining amount must be zero or greater.");
        }

        // Step 8: Calculate total amount
        // Total = advance already paid + remaining paid now
        Double advancePaid = booking.getAdvanceAmount();
        Double remainingAmount = dto.getRemainingAmount();
        Double totalAmount = advancePaid + remainingAmount;

        // Step 9: Create the Sale record
        Sale sale = new Sale();
        sale.setBooking(booking);
        sale.setDealer(dealer);
        sale.setCustomer(booking.getCustomer());
        sale.setVariant(booking.getVariant());
        sale.setColour(booking.getColour());
        sale.setTotalAmount(totalAmount);
        sale.setAdvancePaid(advancePaid);
        sale.setRemainingAmount(remainingAmount);
        sale.setPaymentMode(dto.getPaymentMode());
        sale.setSaleStatus(AppConstants.SALE_COMPLETED);
        sale.setNotes(dto.getNotes());

        Sale savedSale = saleRepository.save(sale);

        // Step 10: Create ADVANCE payment record
        // This records the advance that was paid during booking
        Payment advancePayment = new Payment();
        advancePayment.setSale(savedSale);
        advancePayment.setDealer(dealer);
        advancePayment.setPaymentType(AppConstants.PAYMENT_ADVANCE);
        advancePayment.setAmount(advancePaid);
        advancePayment.setPaymentMode(booking.getPaymentMode());
        advancePayment.setNotes("Advance paid during booking #" + booking.getId());
        paymentRepository.save(advancePayment);

        // Step 11: Create REMAINING payment record
        // Only create if remaining amount is greater than zero
        if (remainingAmount > 0) {
            Payment remainingPayment = new Payment();
            remainingPayment.setSale(savedSale);
            remainingPayment.setDealer(dealer);

            // If payment mode is Loan — record as LOAN type
            if (AppConstants.PAYMENT_MODE_LOAN.equalsIgnoreCase(dto.getPaymentMode())) {
                remainingPayment.setPaymentType(AppConstants.PAYMENT_LOAN);
                String loanNote = "Loan";
                if (dto.getLoanBank() != null && !dto.getLoanBank().isBlank()) {
                    loanNote += " — Bank: " + dto.getLoanBank();
                }
                if (dto.getLoanReferenceNumber() != null && !dto.getLoanReferenceNumber().isBlank()) {
                    loanNote += " | Ref: " + dto.getLoanReferenceNumber();
                }
                remainingPayment.setNotes(loanNote);
            } else {
                remainingPayment.setPaymentType(AppConstants.PAYMENT_REMAINING);
                remainingPayment.setNotes("Remaining payment for sale #" + savedSale.getId());
            }

            remainingPayment.setAmount(remainingAmount);
            remainingPayment.setPaymentMode(dto.getPaymentMode());
            paymentRepository.save(remainingPayment);
        }

        // Step 12: Reduce inventory
        // This reduces stockQuantity by 1 and reservedQuantity by 1
        inventoryService.reduceStock(
                dealer.getId(),
                booking.getVariant().getId(),
                booking.getColour().getId()
        );

        // Step 13: Mark booking as CONVERTED
        booking.setBookingStatus(AppConstants.BOOKING_CONVERTED);
        bookingRepository.save(booking);

        return savedSale;
    }

    // -------------------------------------------------------
    // DEALER: Get all their sales
    // -------------------------------------------------------
    public List<Sale> getMySales(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return saleRepository.findByDealerIdOrderBySaleDateDesc(
                user.getDealer().getId()
        );
    }

    // -------------------------------------------------------
    // DEALER: Get single sale by ID
    // -------------------------------------------------------
    public Sale getSaleById(String username, Long saleId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new RuntimeException("Sale not found."));

        // Make sure this sale belongs to this dealer
        if (!sale.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this sale.");
        }

        return sale;
    }

    // -------------------------------------------------------
    // DEALER: Get all payments for a specific sale
    // -------------------------------------------------------
    public List<Payment> getPaymentsForSale(String username, Long saleId) {

        // Validate sale belongs to this dealer first
        getSaleById(username, saleId);

        return paymentRepository.findBySaleId(saleId);
    }

    // -------------------------------------------------------
    // DEALER: Get all their payments
    // -------------------------------------------------------
    public List<Payment> getMyPayments(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return paymentRepository.findByDealerIdOrderByPaymentDateDesc(
                user.getDealer().getId()
        );
    }
}