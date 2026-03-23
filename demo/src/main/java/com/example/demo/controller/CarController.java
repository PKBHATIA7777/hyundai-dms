package com.example.demo.controller;

import com.example.demo.dto.CarDto;
import com.example.demo.dto.ColourDto;
import com.example.demo.dto.VariantDto;
import com.example.demo.entity.Car;
import com.example.demo.entity.Colour;
import com.example.demo.entity.Variant;
import com.example.demo.service.CarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class CarController {

    @Autowired
    private CarService carService;

    // --- Car Endpoints ---

    @PostMapping("/cars")
    public ResponseEntity<?> createCar(@RequestBody CarDto dto) {
        try {
            Car car = carService.createCar(dto);
            return ResponseEntity.ok(car);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cars")
    public ResponseEntity<List<Car>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    // --- Public Dealer Endpoint ---
    // Allows dealers to fetch car catalog for stock requests (Day 6)
    @GetMapping("/dealer/cars")  // ✅ Fixed — removed duplicate /api prefix
    public ResponseEntity<List<Car>> getAllCarsPublic() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    // --- Variant Endpoints ---

    @PostMapping("/cars/{carId}/variants")
    public ResponseEntity<?> addVariant(@PathVariable Long carId, @RequestBody VariantDto dto) {
        try {
            Variant variant = carService.addVariantToCar(carId, dto);
            return ResponseEntity.ok(variant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- Colour Endpoints ---

    @PostMapping("/colours")
    public ResponseEntity<?> addColour(@RequestBody ColourDto dto) {
        Map<String, Object> result = carService.addColour(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/colours")
    public ResponseEntity<List<Colour>> getAllColours() {
        return ResponseEntity.ok(carService.getAllColours());
    }

    // --- Assign Colour to Variant ---

    @PostMapping("/variants/{variantId}/colours")
    public ResponseEntity<?> assignColourToVariant(@PathVariable Long variantId, @RequestBody ColourDto dto) {
        try {
            Map<String, Object> result = carService.assignColourToVariant(variantId, dto);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}