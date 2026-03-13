package com.example.demo.repository;

import com.example.demo.entity.SystemCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemCheckRepository extends JpaRepository<SystemCheck, Long> {
}