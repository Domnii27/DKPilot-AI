package com.dkpilot.backend.controller;

import com.dkpilot.backend.dto.BusinessReportRequest;
import com.dkpilot.backend.entity.Invoice;
import com.dkpilot.backend.repository.CustomerRepository;
import com.dkpilot.backend.repository.EmailHistoryRepository;
import com.dkpilot.backend.repository.InvoiceRepository;
import com.dkpilot.backend.repository.ScheduleRepository;
import com.dkpilot.backend.service.OpenAIService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/business-report")
@CrossOrigin(origins = "http://localhost:5173")
public class BusinessReportController {

    @Autowired
    private OpenAIService openAIService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EmailHistoryRepository emailHistoryRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @PostMapping("/generate")
    public Map<String, String> generateReport(
            @RequestBody BusinessReportRequest request,
            Authentication authentication
    ) {

        Map<String, String> response = new HashMap<>();

        if (authentication == null) {
            response.put("report",
                    "User not authenticated.");
            return response;
        }

        long totalCustomers =
                customerRepository.count();

        long totalInvoices =
                invoiceRepository.count();

        long totalEmails =
                emailHistoryRepository.count();

        long totalSchedules =
                scheduleRepository.count();

        List<Invoice> invoices =
                invoiceRepository.findAll();

        double totalRevenue =
                invoices.stream()
                        .mapToDouble(invoice ->
                                invoice.getTotalAmount() != null
                                        ? invoice.getTotalAmount()
                                        : 0
                        )
                        .sum();

        String reportType =
                request.getReportType() == null
                        ? "Business Report"
                        : request.getReportType();

        String customPrompt =
                request.getCustomPrompt() == null
                        ? ""
                        : request.getCustomPrompt();

        String aiPrompt = """
You are a professional Business Analyst.

Generate a detailed business report.

Business Statistics:

Total Customers: %d

Total Invoices: %d

Total Revenue: %.2f INR

Emails Sent: %d

Schedules Created: %d

Report Type:
%s

Additional User Request:
%s

The report should contain:

1. Executive Summary

2. Revenue Analysis

3. Customer Analysis

4. Business Performance

5. Key Insights

6. Recommendations

Write professionally.

Do NOT use markdown.

""".formatted(
                totalCustomers,
                totalInvoices,
                totalRevenue,
                totalEmails,
                totalSchedules,
                reportType,
                customPrompt
        );

        String report =
                openAIService.generateResponse(aiPrompt);

        response.put("report", report);

        return response;
    }
}