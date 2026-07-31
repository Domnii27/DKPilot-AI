package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.InvoiceRequest;
import com.dkpilot.backend.entity.Invoice;
import com.dkpilot.backend.service.InvoiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping
    public Invoice createInvoice(@RequestBody InvoiceRequest request) {
        return invoiceService.createInvoice(request);
    }

    @GetMapping("/history")
    public List<Invoice> getInvoiceHistory() {
        return invoiceService.getInvoiceHistory();
    }
}