package com.example.demo.repository;
import com.example.demo.entity.DealerInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DealerInventoryRepository extends JpaRepository<DealerInventory, Long> {
    List<DealerInventory> findByDealerId(Long dealerId);
}