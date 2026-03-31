package com.example.demo.service;

import com.example.demo.dto.LeadDto;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeadService {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private DealerRepository dealerRepository;

    @Transactional
    public Lead createLead(String username, LeadDto dto) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Dealer dealer = user.getDealer();

        Customer customer = customerRepository.findByPhone(dto.getPhone())
                .orElse(null);

        if (customer == null) {
            if (dto.getFirstName() == null || dto.getFirstName().isBlank()) {
                throw new RuntimeException("First name is required for new customer.");
            }
            if (dto.getLastName() == null || dto.getLastName().isBlank()) {
                throw new RuntimeException("Last name is required for new customer.");
            }

            customer = new Customer();
            customer.setFirstName(dto.getFirstName());
            customer.setLastName(dto.getLastName());
            customer.setPhone(dto.getPhone());
            customer.setEmail(dto.getEmail());
            customer.setAddress(dto.getAddress());
            customer = customerRepository.save(customer);
        }

        boolean leadExists = leadRepository.existsByCustomerIdAndDealerId(
                customer.getId(), dealer.getId()
        );

        if (leadExists) {
            throw new RuntimeException(
                "A lead already exists for this customer at your dealership."
            );
        }

        Variant variant = null;
        if (dto.getVariantId() != null) {
            variant = variantRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found."));
        }

        Lead lead = new Lead();
        lead.setCustomer(customer);
        lead.setDealer(dealer);
        lead.setInterestedVariant(variant);
        lead.setSource(dto.getSource());
        lead.setNotes(dto.getNotes());
        lead.setStatus(AppConstants.LEAD_NEW);

        return leadRepository.save(lead);
    }

    public List<Lead> getMyLeads(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return leadRepository.findByDealerIdOrderByCreatedAtDesc(
                user.getDealer().getId()
        );
    }

    @Transactional
    public void updateLeadStatus(String username, Long leadId, String newStatus) {

        // Step 1: Validate status value first
        List<String> validStatuses = List.of(
                AppConstants.LEAD_NEW,
                AppConstants.LEAD_CONTACTED,
                AppConstants.LEAD_INTERESTED,
                AppConstants.LEAD_BOOKED,
                AppConstants.LEAD_LOST
        );

        if (!validStatuses.contains(newStatus)) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }

        // Step 2: Get dealer ID from username safely
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Long dealerId = user.getDealer().getId();

        // Step 3: Find lead
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found with id: " + leadId));

        // Step 4: Check dealer owns this lead
        if (lead.getDealer() == null) {
            throw new RuntimeException("Lead has no dealer assigned.");
        }

        if (!lead.getDealer().getId().equals(dealerId)) {
            throw new RuntimeException("You do not have access to this lead.");
        }

        // Step 5: Check current status allows transition
        String currentStatus = lead.getStatus();

        if (AppConstants.LEAD_BOOKED.equals(currentStatus)) {
            throw new RuntimeException("Cannot change status of a booked lead.");
        }

        if (AppConstants.LEAD_LOST.equals(currentStatus)) {
            throw new RuntimeException("Cannot reopen a lost lead.");
        }

        // Step 6: Update using JPQL to avoid any entity serialization issue
        leadRepository.updateLeadStatus(leadId, newStatus);
    }

    public List<Lead> getMyLeadsByStatus(String username, String status) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        return leadRepository.findByDealerIdAndStatusOrderByCreatedAtDesc(
                user.getDealer().getId(), status
        );
    }
}