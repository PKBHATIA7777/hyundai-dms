package com.example.demo.repository;

import com.example.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByDealerIdOrderByBookingDateDesc(Long dealerId);

    List<Booking> findByDealerIdAndBookingStatusOrderByBookingDateDesc(
        Long dealerId, String bookingStatus
    );

    boolean existsByDealerIdAndVariantIdAndColourIdAndBookingStatus(
        Long dealerId, Long variantId, Long colourId, String bookingStatus
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.dealer.id = :dealerId " +
           "AND b.bookingStatus = 'CONFIRMED'")
    long countActiveBookingsByDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.dealer.id = :dealerId")
    long countAllByDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.dealer.id = :dealerId " +
           "AND b.bookingStatus = :status")
    long countByDealerAndStatus(
        @Param("dealerId") Long dealerId,
        @Param("status") String status
    );
}