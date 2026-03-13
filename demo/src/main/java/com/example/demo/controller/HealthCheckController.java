package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class HealthCheckController {

    @GetMapping("/status")
    public String getStatus() {
        return "Hyundai DMS Backend: Operational";
    }
}