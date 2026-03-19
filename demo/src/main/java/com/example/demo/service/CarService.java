package com.example.demo.service;

import com.example.demo.dto.CarDto;
import com.example.demo.dto.ColourDto;
import com.example.demo.dto.VariantDto;
import com.example.demo.entity.Car;
import com.example.demo.entity.Colour;
import com.example.demo.entity.Variant;
import com.example.demo.repository.CarRepository;
import com.example.demo.repository.ColourRepository;
import com.example.demo.repository.VariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private ColourRepository colourRepository;

    // --- Car ---

    public Car createCar(CarDto dto) {
        boolean exists = carRepository.existsByModelNameIgnoreCase(dto.getModelName());
        if (exists) {
            throw new RuntimeException("Car model with this name already exists.");
        }
        Car car = new Car();
        car.setModelName(dto.getModelName());
        return carRepository.save(car);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    // --- Variant ---

    public Variant addVariantToCar(Long carId, VariantDto dto) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found."));

        Variant variant = new Variant();
        variant.setVariantName(dto.getVariantName());
        variant.setPrice(dto.getPrice());
        variant.setCar(car);
        return variantRepository.save(variant);
    }

    // --- Colour ---

    public Map<String, Object> addColour(ColourDto dto) {
        Map<String, Object> response = new HashMap<>();

        Optional<Colour> existingByName = colourRepository.findByColourNameIgnoreCase(dto.getColourName());
        if (existingByName.isPresent()) {
            response.put("warning", "Colour with this name already exists. Existing colour returned.");
            response.put("colour", existingByName.get());
            return response;
        }

        Optional<Colour> existingByCode = colourRepository.findByColourCodeIgnoreCase(dto.getColourCode());
        if (existingByCode.isPresent()) {
            response.put("warning", "Colour with this code already exists. Existing colour returned.");
            response.put("colour", existingByCode.get());
            return response;
        }

        Colour colour = new Colour();
        colour.setColourName(dto.getColourName());
        colour.setColourCode(dto.getColourCode());
        Colour saved = colourRepository.save(colour);

        response.put("colour", saved);
        return response;
    }

    public List<Colour> getAllColours() {
        return colourRepository.findAll();
    }

    // --- Assign Colour to Variant ---

    public Map<String, Object> assignColourToVariant(Long variantId, ColourDto dto) {
        Map<String, Object> response = new HashMap<>();

        Variant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found."));

        // Find or create colour
        Colour colour;
        Optional<Colour> existingByName = colourRepository.findByColourNameIgnoreCase(dto.getColourName());

        if (existingByName.isPresent()) {
            colour = existingByName.get();
            response.put("warning", "Colour already existed. Linked existing colour to variant.");
        } else {
            colour = new Colour();
            colour.setColourName(dto.getColourName());
            colour.setColourCode(dto.getColourCode());
            colour = colourRepository.save(colour);
        }

        // Check if already assigned
        if (variant.getAvailableColours() != null && variant.getAvailableColours().contains(colour)) {
            response.put("warning", "This colour is already assigned to this variant.");
            response.put("variant", variant);
            return response;
        }

        variant.getAvailableColours().add(colour);
        variantRepository.save(variant);

        response.put("variant", variant);
        return response;
    }
}