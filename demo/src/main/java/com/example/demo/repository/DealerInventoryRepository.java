package com.example.demo.repository;

import com.example.demo.entity.DealerInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealerInventoryRepository extends JpaRepository<DealerInventory, Long> {

    List<DealerInventory> findByDealerId(Long dealerId);

    Optional<DealerInventory> findByDealerIdAndVariantIdAndColourId(
        Long dealerId, Long variantId, Long colourId
    );

    @Query("SELECT COALESCE(SUM(d.stockQuantity - d.reservedQuantity), 0) " +
           "FROM DealerInventory d WHERE d.dealer.id = :dealerId")
    long sumAvailableStockByDealer(@Param("dealerId") Long dealerId);

    @Query("SELECT COALESCE(SUM(d.stockQuantity), 0) " +
           "FROM DealerInventory d WHERE d.dealer.id = :dealerId")
    long sumTotalStockByDealer(@Param("dealerId") Long dealerId);
}