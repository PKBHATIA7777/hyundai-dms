package com.example.demo.service;

import com.example.demo.dto.BookingDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private ColourRepository colourRepository;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private InventoryService inventoryService;

    // -------------------------------------------------------
    // DEALER: Create a booking
    // -------------------------------------------------------
    @Transactional
    public Booking createBooking(String username, BookingDto dto) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Dealer dealer = user.getDealer();

        if (dto.getVariantId() == null) {
            throw new RuntimeException("Variant is required.");
        }
        if (dto.getColourId() == null) {
            throw new RuntimeException("Colour is required.");
        }
        if (dto.getAdvanceAmount() == null || dto.getAdvanceAmount() <= 0) {
            throw new RuntimeException("Advance amount must be greater than zero.");
        }
        if (dto.getPhone() == null || dto.getPhone().isBlank()) {
            throw new RuntimeException("Customer phone is required.");
        }

        Customer customer = customerRepository.findByPhone(dto.getPhone())
                .orElse(null);

        if (customer == null) {
            if (dto.getFirstName() == null || dto.getFirstName().isBlank()) {
                throw new RuntimeException("First name is required for new customer.");
            }
            if (dto.getLastName() == null || dto.getLastName().isBlank()) {
                throw new RuntimeException("Last name is required for new customer.");
            }

            customer = new Customer();
            customer.setFirstName(dto.getFirstName());
            customer.setLastName(dto.getLastName());
            customer.setPhone(dto.getPhone());
            customer.setEmail(dto.getEmail());
            customer.setAddress(dto.getAddress());
            customer.setPanNumber(dto.getPanNumber());
            customer = customerRepository.save(customer);
        }

        Variant variant = variantRepository.findById(dto.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found."));

        Colour colour = colourRepository.findById(dto.getColourId())
                .orElseThrow(() -> new RuntimeException("Colour not found."));

        inventoryService.reserveStock(
                dealer.getId(),
                variant.getId(),
                colour.getId()
        );

        Lead lead = null;
        if (dto.getLeadId() != null) {
            lead = leadRepository.findById(dto.getLeadId())
                    .orElseThrow(() -> new RuntimeException("Lead not found."));

            if (!lead.getDealer().getId().equals(dealer.getId())) {
                throw new RuntimeException("This lead does not belong to your dealership.");
            }

            lead.setStatus(AppConstants.LEAD_BOOKED);
            leadRepository.save(lead);
        }

        Booking booking = new Booking();
        booking.setDealer(dealer);
        booking.setCustomer(customer);
        booking.setVariant(variant);
        booking.setColour(colour);
        booking.setAdvanceAmount(dto.getAdvanceAmount());
        booking.setPaymentMode(dto.getPaymentMode());
        booking.setNotes(dto.getNotes());
        booking.setLead(lead);
        booking.setBookingStatus(AppConstants.BOOKING_CONFIRMED);

        return bookingRepository.save(booking);
    }

    // -------------------------------------------------------
    // DEALER: Get all their bookings
    // -------------------------------------------------------
    public List<Booking> getMyBookings(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return bookingRepository.findByDealerIdOrderByBookingDateDesc(
                user.getDealer().getId()
        );
    }

    // -------------------------------------------------------
    // DEALER: Get bookings filtered by status
    // -------------------------------------------------------
    public List<Booking> getMyBookingsByStatus(String username, String status) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return bookingRepository.findByDealerIdAndBookingStatusOrderByBookingDateDesc(
                user.getDealer().getId(), status
        );
    }

    // -------------------------------------------------------
    // DEALER: Get single booking by ID
    // -------------------------------------------------------
    public Booking getBookingById(String username, Long bookingId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (!booking.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this booking.");
        }

        return booking;
    }

    // -------------------------------------------------------
    // DEALER: Cancel a confirmed booking
    // Releases reserved inventory
    // -------------------------------------------------------
    @Transactional
    public Booking cancelBooking(String username, Long bookingId) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        if (!booking.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this booking.");
        }

        if (!booking.getBookingStatus().equals(AppConstants.BOOKING_CONFIRMED)) {
            throw new RuntimeException(
                    "Only CONFIRMED bookings can be cancelled. " +
                    "Current status: " + booking.getBookingStatus()
            );
        }

        // Release reserved inventory
        inventoryService.releaseStock(
                user.getDealer().getId(),
                booking.getVariant().getId(),
                booking.getColour().getId()
        );

        // Update lead status back to INTERESTED if linked
        if (booking.getLead() != null) {
            Lead lead = booking.getLead();
            lead.setStatus(AppConstants.LEAD_INTERESTED);
            leadRepository.save(lead);
        }

        booking.setBookingStatus(AppConstants.BOOKING_CANCELLED);
        return bookingRepository.save(booking);
    }
}