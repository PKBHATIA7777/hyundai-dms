




package com.example.demo.service;

import com.example.demo.dto.InsuranceDto;
import com.example.demo.dto.SaleDto;
import com.example.demo.dto.SaleItemDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    @Autowired private SaleRepository saleRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InventoryService inventoryService;
    @Autowired private AccessoryRepository accessoryRepository;
    @Autowired private SaleAccessoryRepository saleAccessoryRepository;
    @Autowired private InsuranceRepository insuranceRepository;
    @Autowired private EmployeeRepository employeeRepository;

    // -------------------------------------------------------
    // DEALER: Create a sale from a confirmed booking
    //
    // Transaction includes:
    // 1.  Validate dealer + booking ownership
    // 2.  Guard against double-selling
    // 3.  Build and save Sale record
    // 4.  Attach optional employee
    // 5.  Attach optional accessories → save SaleAccessory rows
    // 6.  Attach optional insurance → save Insurance record
    // 7.  Compute grandTotal
    // 8.  Create ADVANCE payment record
    // 9.  Create REMAINING / LOAN payment record
    // 10. Reduce inventory
    // 11. Mark booking CONVERTED
    //
    // If ANY step throws → entire transaction rolls back
    // -------------------------------------------------------
    @Transactional
    public Sale createSale(String username, SaleDto dto) {

        // Step 1: Resolve dealer from JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }
        Dealer dealer = user.getDealer();

        // Step 2: Validate bookingId
        if (dto.getBookingId() == null) {
            throw new RuntimeException("Booking ID is required.");
        }

        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (!booking.getDealer().getId().equals(dealer.getId())) {
            throw new RuntimeException(
                "This booking does not belong to your dealership.");
        }

        if (!booking.getBookingStatus().equals(AppConstants.BOOKING_CONFIRMED)) {
            throw new RuntimeException(
                "Only CONFIRMED bookings can be converted to a sale. " +
                "Current status: " + booking.getBookingStatus());
        }

        // Step 3: Guard against double-selling
        if (saleRepository.existsByBookingId(booking.getId())) {
            throw new RuntimeException("A sale already exists for this booking.");
        }

        // Step 4: Validate remaining amount
        if (dto.getRemainingAmount() == null || dto.getRemainingAmount() < 0) {
            throw new RuntimeException("Remaining amount must be zero or greater.");
        }

        Double advancePaid      = booking.getAdvanceAmount();
        Double remainingAmount  = dto.getRemainingAmount();
        Double totalAmount      = advancePaid + remainingAmount;

        // Step 5: Build core Sale record (no grand total yet)
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
        sale.setAccessoriesAmount(0.0);
        sale.setInsuranceAmount(0.0);
        sale.setGrandTotal(totalAmount); // will be updated below

        // Step 6: Attach optional employee
        if (dto.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found."));

            // Ensure the employee belongs to this dealer
            if (!employee.getDealer().getId().equals(dealer.getId())) {
                throw new RuntimeException(
                    "This employee does not belong to your dealership.");
            }
            if (!employee.getStatus().equals("ACTIVE")) {
                throw new RuntimeException("Cannot assign an inactive employee to a sale.");
            }
            sale.setEmployee(employee);
        }

        // Save sale first so we have an ID for foreign keys
        Sale savedSale = saleRepository.save(sale);

        // Step 7: Process accessories
        double accessoriesTotal = 0.0;

        if (dto.getAccessories() != null && !dto.getAccessories().isEmpty()) {
            List<SaleAccessory> saleAccessories = new ArrayList<>();

            for (SaleItemDto item : dto.getAccessories()) {

                if (item.getAccessoryId() == null) {
                    throw new RuntimeException("Accessory ID is required for each item.");
                }

                Accessory accessory = accessoryRepository
                        .findById(item.getAccessoryId())
                        .orElseThrow(() -> new RuntimeException(
                            "Accessory not found: id=" + item.getAccessoryId()));

                if (!accessory.getStatus().equals("ACTIVE")) {
                    throw new RuntimeException(
                        "Accessory '" + accessory.getName() + "' is not active.");
                }

                int qty = item.getQuantity();
                if (qty < 1) {
                    throw new RuntimeException("Quantity must be at least 1.");
                }

                double lineTotal = accessory.getPrice() * qty;
                accessoriesTotal += lineTotal;

                SaleAccessory sa = new SaleAccessory();
                sa.setSale(savedSale);
                sa.setAccessory(accessory);
                sa.setQuantity(qty);
                sa.setPriceAtSale(accessory.getPrice()); // price snapshot
                saleAccessories.add(sa);
            }

            saleAccessoryRepository.saveAll(saleAccessories);
        }

        // Step 8: Process insurance
        double insuranceTotal = 0.0;

        if (dto.getInsurance() != null) {
            InsuranceDto iDto = dto.getInsurance();

            // Validate required insurance fields
            if (iDto.getProviderName() == null || iDto.getProviderName().isBlank()) {
                throw new RuntimeException("Insurance provider name is required.");
            }
            if (iDto.getPolicyNumber() == null || iDto.getPolicyNumber().isBlank()) {
                throw new RuntimeException("Insurance policy number is required.");
            }
        if (iDto.getPolicyType() == null || iDto.getPolicyType().isBlank()) {
    throw new RuntimeException("Insurance type is required.");
}
            if (iDto.getPremiumAmount() == null || iDto.getPremiumAmount() <= 0) {
                throw new RuntimeException("Insurance premium must be greater than zero.");
            }
            if (iDto.getStartDate() == null || iDto.getEndDate() == null) {
                throw new RuntimeException("Insurance start and end dates are required.");
            }
            if (iDto.getEndDate().isBefore(iDto.getStartDate())) {
                throw new RuntimeException("Insurance end date cannot be before start date.");
            }
            if (insuranceRepository.existsByPolicyNumber(iDto.getPolicyNumber())) {
                throw new RuntimeException(
                    "Insurance policy number '" + iDto.getPolicyNumber() +
                    "' already exists in the system.");
            }

            insuranceTotal = iDto.getPremiumAmount();

            Insurance insurance = new Insurance();
            insurance.setSale(savedSale);
            insurance.setProviderName(iDto.getProviderName());
            insurance.setPolicyNumber(iDto.getPolicyNumber());
          insurance.setPolicyType(iDto.getPolicyType());
            insurance.setPremiumAmount(iDto.getPremiumAmount());
            insurance.setStartDate(iDto.getStartDate());
            insurance.setEndDate(iDto.getEndDate());
            insurance.setNotes(iDto.getNotes());
            insuranceRepository.save(insurance);
        }

        // Step 9: Update grand total on the sale record
        double grandTotal = totalAmount + accessoriesTotal + insuranceTotal;
        savedSale.setAccessoriesAmount(accessoriesTotal);
        savedSale.setInsuranceAmount(insuranceTotal);
        savedSale.setGrandTotal(grandTotal);
        saleRepository.save(savedSale);

        // Step 10: Create ADVANCE payment record
        Payment advancePayment = new Payment();
        advancePayment.setSale(savedSale);
        advancePayment.setDealer(dealer);
        advancePayment.setPaymentType(AppConstants.PAYMENT_ADVANCE);
        advancePayment.setAmount(advancePaid);
        advancePayment.setPaymentMode(booking.getPaymentMode());
        advancePayment.setNotes("Advance paid during booking #" + booking.getId());
        paymentRepository.save(advancePayment);

        // Step 11: Create REMAINING / LOAN payment record
        if (remainingAmount > 0) {
            Payment remainingPayment = new Payment();
            remainingPayment.setSale(savedSale);
            remainingPayment.setDealer(dealer);
            remainingPayment.setAmount(remainingAmount);
            remainingPayment.setPaymentMode(dto.getPaymentMode());

            if (AppConstants.PAYMENT_MODE_LOAN
                    .equalsIgnoreCase(dto.getPaymentMode())) {
                remainingPayment.setPaymentType(AppConstants.PAYMENT_LOAN);
                StringBuilder loanNote = new StringBuilder("Loan");
                if (dto.getLoanBank() != null && !dto.getLoanBank().isBlank()) {
                    loanNote.append(" — Bank: ").append(dto.getLoanBank());
                }
                if (dto.getLoanReferenceNumber() != null
                        && !dto.getLoanReferenceNumber().isBlank()) {
                    loanNote.append(" | Ref: ").append(dto.getLoanReferenceNumber());
                }
                remainingPayment.setNotes(loanNote.toString());
            } else {
                remainingPayment.setPaymentType(AppConstants.PAYMENT_REMAINING);
                remainingPayment.setNotes(
                    "Remaining payment for sale #" + savedSale.getId());
            }

            paymentRepository.save(remainingPayment);
        }

        // Step 12: Reduce inventory
        inventoryService.reduceStock(
                dealer.getId(),
                booking.getVariant().getId(),
                booking.getColour().getId()
        );

        // Step 13: Mark booking CONVERTED
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
                user.getDealer().getId());
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
        if (!sale.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this sale.");
        }
        return sale;
    }

    // -------------------------------------------------------
    // DEALER: Get accessories for a specific sale
    // -------------------------------------------------------
    public List<SaleAccessory> getAccessoriesForSale(String username, Long saleId) {
        getSaleById(username, saleId); // validates ownership
        return saleAccessoryRepository.findBySaleId(saleId);
    }

    // -------------------------------------------------------
    // DEALER: Get insurance for a specific sale
    // -------------------------------------------------------
    public Insurance getInsuranceForSale(String username, Long saleId) {
        getSaleById(username, saleId); // validates ownership
        return insuranceRepository.findBySaleId(saleId)
                .orElseThrow(() -> new RuntimeException(
                    "No insurance found for this sale."));
    }

    // -------------------------------------------------------
    // DEALER: Get all payments for a specific sale
    // -------------------------------------------------------
    public List<Payment> getPaymentsForSale(String username, Long saleId) {
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
                user.getDealer().getId());
    }
}