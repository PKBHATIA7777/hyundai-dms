package com.example.demo.repository;

import com.example.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Get all bookings for a specific dealer — latest first
    List<Booking> findByDealerIdOrderByBookingDateDesc(Long dealerId);

    // Get bookings by status for a dealer
    List<Booking> findByDealerIdAndBookingStatusOrderByBookingDateDesc(
        Long dealerId, String bookingStatus
    );

    // Check if an active booking already exists for this variant+colour at this dealer
    boolean existsByDealerIdAndVariantIdAndColourIdAndBookingStatus(
        Long dealerId, Long variantId, Long colourId, String bookingStatus
    );
}