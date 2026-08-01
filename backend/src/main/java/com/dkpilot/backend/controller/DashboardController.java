package com.dkpilot.backend.controller;

import com.dkpilot.backend.entity.Invoice;
import com.dkpilot.backend.repository.CustomerRepository;
import com.dkpilot.backend.repository.EmailHistoryRepository;
import com.dkpilot.backend.repository.InvoiceRepository;
import com.dkpilot.backend.repository.ScheduleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private EmailHistoryRepository emailHistoryRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @GetMapping
    public Map<String, Object> getDashboardData() {

        Map<String, Object> data = new HashMap<>();

        long customerCount = customerRepository.count();
        long invoiceCount = invoiceRepository.count();
        long emailCount = emailHistoryRepository.count();
        long scheduleCount = scheduleRepository.count();

        List<Invoice> invoices = invoiceRepository.findAll();

        double totalRevenue = invoices.stream()
                .mapToDouble(invoice ->
                        invoice.getTotalAmount() != null
                                ? invoice.getTotalAmount()
                                : 0.0
                )
                .sum();

        Map<Integer, Double> monthlyRevenueMap =
                new HashMap<>();

        for (int month = 1; month <= 12; month++) {
            monthlyRevenueMap.put(month, 0.0);
        }

        for (Invoice invoice : invoices) {

            if (
                    invoice.getCreatedDate() != null &&
                    invoice.getTotalAmount() != null
            ) {
                int month =
                        invoice.getCreatedDate()
                                .getMonthValue();

                double existingRevenue =
                        monthlyRevenueMap.get(month);

                monthlyRevenueMap.put(
                        month,
                        existingRevenue +
                                invoice.getTotalAmount()
                );
            }
        }

        List<Map<String, Object>> monthlyRevenue =
                new ArrayList<>();

        for (int month = 1; month <= 12; month++) {

            Map<String, Object> monthData =
                    new HashMap<>();

            String monthName =
                    Month.of(month)
                            .getDisplayName(
                                    TextStyle.SHORT,
                                    Locale.ENGLISH
                            );

            monthData.put("month", monthName);

            monthData.put(
                    "revenue",
                    monthlyRevenueMap.get(month)
            );

            monthlyRevenue.add(monthData);
        }

        data.put("customers", customerCount);
        data.put("invoices", invoiceCount);
        data.put("emails", emailCount);
        data.put("schedules", scheduleCount);
        data.put("totalRevenue", totalRevenue);
        data.put("monthlyRevenue", monthlyRevenue);

        return data;
    }
}