package com.example.demo.controller;

import com.example.demo.dto.BookingDto;
import com.example.demo.entity.Booking;
import com.example.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dealer")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // -------------------------------------------------------
    // POST /api/dealer/bookings
    // Create a new booking
    // Reserves inventory automatically
    // -------------------------------------------------------
    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody BookingDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Booking booking = bookingService.createBooking(auth.getName(), dto);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/bookings
    // Get all bookings for this dealer
    // Optional query param: ?status=CONFIRMED
    // -------------------------------------------------------
    @GetMapping("/bookings")
    public ResponseEntity<?> getMyBookings(
            @RequestParam(required = false) String status) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            List<Booking> bookings;
            if (status != null && !status.isBlank()) {
                bookings = bookingService.getMyBookingsByStatus(auth.getName(), status);
            } else {
                bookings = bookingService.getMyBookings(auth.getName());
            }

            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------------------------
    // GET /api/dealer/bookings/{id}
    // Get single booking details
    // -------------------------------------------------------
    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Booking booking = bookingService.getBookingById(auth.getName(), id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}