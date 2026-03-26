package com.example.demo.repository;

import com.example.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findBySaleId(Long saleId);

    List<Payment> findByDealerIdOrderByPaymentDateDesc(Long dealerId);

    List<Payment> findByDealerIdAndPaymentTypeOrderByPaymentDateDesc(
        Long dealerId, String paymentType
    );

    @Query("SELECT p FROM Payment p ORDER BY p.paymentDate DESC")
    List<Payment> findAllOrderByPaymentDateDesc();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.dealer.id = :dealerId")
    double sumAmountByDealer(@Param("dealerId") Long dealerId);
}