package com.dkpilot.backend.repository;

import com.dkpilot.backend.entity.Invoice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    List<Invoice> findByUserEmailOrderByCreatedDateDesc(
            String userEmail
    );

    Optional<Invoice> findTopByUserEmailOrderByTotalAmountDesc(
            String userEmail
    );

    List<Invoice> findByUserEmail(
            String userEmail
    );
}