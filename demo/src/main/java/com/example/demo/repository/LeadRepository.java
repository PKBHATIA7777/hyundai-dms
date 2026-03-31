package com.example.demo.repository;

import com.example.demo.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByDealerIdOrderByCreatedAtDesc(Long dealerId);

    List<Lead> findByDealerIdAndStatusOrderByCreatedAtDesc(Long dealerId, String status);

    boolean existsByCustomerIdAndDealerId(Long customerId, Long dealerId);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.dealer.id = :dealerId " +
           "AND l.status NOT IN ('BOOKED', 'LOST')")
    long countOpenLeadsByDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.dealer.id = :dealerId")
    long countAllByDealer(@Param("dealerId") Long dealerId);

    // NEW: Direct JPQL update — avoids loading and serializing the entity entirely
    @Modifying
    @Query("UPDATE Lead l SET l.status = :status WHERE l.id = :leadId")
    void updateLeadStatus(@Param("leadId") Long leadId, @Param("status") String status);
}