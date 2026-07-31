
package com.dkpilot.backend.service;

import com.dkpilot.backend.dto.InvoiceRequest;
import com.dkpilot.backend.entity.Invoice;
import com.dkpilot.backend.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Value("${spring.mail.username}")
    private String userEmail;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public Invoice createInvoice(InvoiceRequest request) {

        if (request.getAmount() == null || request.getAmount() < 0) {
            throw new IllegalArgumentException("Amount must be valid");
        }

        if (
                request.getGstPercentage() == null ||
                request.getGstPercentage() < 0
        ) {
            throw new IllegalArgumentException(
                    "GST percentage must be valid"
            );
        }

        double gstAmount =
                request.getAmount() *
                request.getGstPercentage() /
                100;

        double totalAmount =
                request.getAmount() + gstAmount;

        Invoice invoice = new Invoice();

        invoice.setClientName(request.getClientName());
        invoice.setClientEmail(request.getClientEmail());
        invoice.setItemDescription(request.getItemDescription());
        invoice.setAmount(request.getAmount());
        invoice.setGstPercentage(request.getGstPercentage());
        invoice.setGstAmount(gstAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setCreatedDate(LocalDateTime.now());
        invoice.setUserEmail(userEmail);

        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getInvoiceHistory() {
        return invoiceRepository
                .findByUserEmailOrderByCreatedDateDesc(userEmail);
    }
}