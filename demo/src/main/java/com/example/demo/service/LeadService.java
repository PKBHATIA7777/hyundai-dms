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

    // -------------------------------------------------------
    // DEALER: Create a new lead
    // Logic: if customer with this phone exists — reuse them
    //        if not — create new customer
    // -------------------------------------------------------
    @Transactional
    public Lead createLead(String username, LeadDto dto) {

        // Step 1: Get dealer from logged in user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        Dealer dealer = user.getDealer();

        // Step 2: Find or create customer by phone
        Customer customer = customerRepository.findByPhone(dto.getPhone())
                .orElse(null);

        if (customer == null) {
            // New customer — create them
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

        // Step 3: Check if lead already exists for this customer at this dealer
        boolean leadExists = leadRepository.existsByCustomerIdAndDealerId(
                customer.getId(), dealer.getId()
        );

        if (leadExists) {
            throw new RuntimeException(
                "A lead already exists for this customer at your dealership."
            );
        }

        // Step 4: Find variant if provided
        Variant variant = null;
        if (dto.getVariantId() != null) {
            variant = variantRepository.findById(dto.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found."));
        }

        // Step 5: Create the lead
        Lead lead = new Lead();
        lead.setCustomer(customer);
        lead.setDealer(dealer);
        lead.setInterestedVariant(variant);
        lead.setSource(dto.getSource());
        lead.setNotes(dto.getNotes());
        lead.setStatus(AppConstants.LEAD_NEW);

        return leadRepository.save(lead);
    }

    // -------------------------------------------------------
    // DEALER: Get all their leads
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // DEALER: Update lead status
    // Valid transitions:
    // NEW -> CONTACTED -> INTERESTED -> BOOKED / LOST
    // -------------------------------------------------------
    @Transactional
    public Lead updateLeadStatus(String username, Long leadId, String newStatus) {

        // Step 1: Validate new status
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

        // Step 2: Get dealer from logged in user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.getDealer() == null) {
            throw new RuntimeException("No dealer account linked to this user.");
        }

        // Step 3: Find the lead
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found."));

        // Step 4: Make sure this lead belongs to this dealer
        if (!lead.getDealer().getId().equals(user.getDealer().getId())) {
            throw new RuntimeException("You do not have access to this lead.");
        }

        // Step 5: Cannot change status of a BOOKED or LOST lead
        if (lead.getStatus().equals(AppConstants.LEAD_BOOKED)) {
            throw new RuntimeException("Cannot change status of a booked lead.");
        }

        if (lead.getStatus().equals(AppConstants.LEAD_LOST)) {
            throw new RuntimeException("Cannot reopen a lost lead.");
        }

        // Step 6: Update status
        lead.setStatus(newStatus);
        return leadRepository.save(lead);
    }

    // -------------------------------------------------------
    // DEALER: Get leads filtered by status
    // -------------------------------------------------------
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
