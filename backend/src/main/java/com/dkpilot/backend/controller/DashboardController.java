package com.dkpilot.backend.controller;

import com.dkpilot.backend.entity.EmailHistory;
import com.dkpilot.backend.entity.Invoice;
import com.dkpilot.backend.entity.Schedule;

import com.dkpilot.backend.repository.CustomerRepository;
import com.dkpilot.backend.repository.EmailHistoryRepository;
import com.dkpilot.backend.repository.InvoiceRepository;
import com.dkpilot.backend.repository.ScheduleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;

import java.util.ArrayList;
import java.util.Comparator;
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

        List<Invoice> invoices =
                invoiceRepository.findAll();

        List<EmailHistory> emailHistoryList =
                emailHistoryRepository.findAll();

        List<Schedule> schedules =
                scheduleRepository.findAll();

        /*
         * ==========================
         * TOTAL REVENUE
         * ==========================
         */

        double totalRevenue = invoices.stream()
                .mapToDouble(invoice ->
                        invoice.getTotalAmount() != null
                                ? invoice.getTotalAmount()
                                : 0.0
                )
                .sum();

        /*
         * ==========================
         * AVERAGE INVOICE VALUE
         * ==========================
         */

        double averageInvoiceValue = 0.0;

        if (!invoices.isEmpty()) {
            averageInvoiceValue =
                    totalRevenue / invoices.size();
        }

        /*
         * ==========================
         * HIGHEST INVOICE
         * ==========================
         */

        Invoice highestInvoice = invoices.stream()
                .filter(invoice ->
                        invoice.getTotalAmount() != null
                )
                .max(
                        Comparator.comparing(
                                Invoice::getTotalAmount
                        )
                )
                .orElse(null);

        Map<String, Object> highestInvoiceData = null;

        if (highestInvoice != null) {

            highestInvoiceData = new HashMap<>();

            highestInvoiceData.put(
                    "id",
                    highestInvoice.getId()
            );

            highestInvoiceData.put(
                    "clientName",
                    highestInvoice.getClientName()
            );

            highestInvoiceData.put(
                    "clientEmail",
                    highestInvoice.getClientEmail()
            );

            highestInvoiceData.put(
                    "totalAmount",
                    highestInvoice.getTotalAmount()
            );

            highestInvoiceData.put(
                    "createdDate",
                    highestInvoice.getCreatedDate()
            );
        }

        /*
         * ==========================
         * CURRENT MONTH REVENUE
         * ==========================
         */

        LocalDate today = LocalDate.now();

        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        double currentMonthRevenue = invoices.stream()
                .filter(invoice ->
                        invoice.getCreatedDate() != null &&
                        invoice.getTotalAmount() != null &&
                        invoice.getCreatedDate()
                                .getMonthValue() == currentMonth &&
                        invoice.getCreatedDate()
                                .getYear() == currentYear
                )
                .mapToDouble(Invoice::getTotalAmount)
                .sum();

        /*
         * ==========================
         * TOP CUSTOMER
         * ==========================
         */

        Map<String, Double> customerRevenueMap =
                new HashMap<>();

        Map<String, Integer> customerInvoiceCountMap =
                new HashMap<>();

        for (Invoice invoice : invoices) {

            if (
                    invoice.getClientName() == null ||
                    invoice.getClientName().trim().isEmpty()
            ) {
                continue;
            }

            String clientName =
                    invoice.getClientName().trim();

            double invoiceTotal =
                    invoice.getTotalAmount() != null
                            ? invoice.getTotalAmount()
                            : 0.0;

            customerRevenueMap.put(
                    clientName,
                    customerRevenueMap.getOrDefault(
                            clientName,
                            0.0
                    ) + invoiceTotal
            );

            customerInvoiceCountMap.put(
                    clientName,
                    customerInvoiceCountMap.getOrDefault(
                            clientName,
                            0
                    ) + 1
            );
        }

        String topCustomerName = null;
        double topCustomerRevenue = 0.0;
        int topCustomerInvoiceCount = 0;

        for (
                Map.Entry<String, Double> entry :
                customerRevenueMap.entrySet()
        ) {

            if (entry.getValue() > topCustomerRevenue) {

                topCustomerName = entry.getKey();
                topCustomerRevenue = entry.getValue();

                topCustomerInvoiceCount =
                        customerInvoiceCountMap
                                .getOrDefault(
                                        entry.getKey(),
                                        0
                                );
            }
        }

        Map<String, Object> topCustomerData = null;

        if (topCustomerName != null) {

            topCustomerData = new HashMap<>();

            topCustomerData.put(
                    "name",
                    topCustomerName
            );

            topCustomerData.put(
                    "totalRevenue",
                    topCustomerRevenue
            );

            topCustomerData.put(
                    "invoiceCount",
                    topCustomerInvoiceCount
            );
        }

        /*
         * ==========================
         * MONTHLY REVENUE
         * ==========================
         */

        Map<Integer, Double> monthlyRevenueMap =
                new HashMap<>();

        Map<Integer, Long> monthlyInvoiceCountMap =
                new HashMap<>();

        for (int month = 1; month <= 12; month++) {

            monthlyRevenueMap.put(month, 0.0);
            monthlyInvoiceCountMap.put(month, 0L);
        }

        for (Invoice invoice : invoices) {

            if (invoice.getCreatedDate() == null) {
                continue;
            }

            int invoiceMonth =
                    invoice.getCreatedDate()
                            .getMonthValue();

            if (invoice.getTotalAmount() != null) {

                double existingRevenue =
                        monthlyRevenueMap.get(
                                invoiceMonth
                        );

                monthlyRevenueMap.put(
                        invoiceMonth,
                        existingRevenue +
                                invoice.getTotalAmount()
                );
            }

            long existingCount =
                    monthlyInvoiceCountMap.get(
                            invoiceMonth
                    );

            monthlyInvoiceCountMap.put(
                    invoiceMonth,
                    existingCount + 1
            );
        }

        List<Map<String, Object>> monthlyRevenue =
                new ArrayList<>();

        List<Map<String, Object>> monthlyInvoiceCount =
                new ArrayList<>();

        for (int month = 1; month <= 12; month++) {

            String monthName =
                    Month.of(month)
                            .getDisplayName(
                                    TextStyle.SHORT,
                                    Locale.ENGLISH
                            );

            Map<String, Object> revenueData =
                    new HashMap<>();

            revenueData.put(
                    "month",
                    monthName
            );

            revenueData.put(
                    "revenue",
                    monthlyRevenueMap.get(month)
            );

            monthlyRevenue.add(revenueData);

            Map<String, Object> invoiceCountData =
                    new HashMap<>();

            invoiceCountData.put(
                    "month",
                    monthName
            );

            invoiceCountData.put(
                    "count",
                    monthlyInvoiceCountMap.get(month)
            );

            monthlyInvoiceCount.add(
                    invoiceCountData
            );
        }

        /*
         * ==========================
         * RECENT ACTIVITIES
         * ==========================
         */

        List<ActivityItem> activityItems =
                new ArrayList<>();

        for (Invoice invoice : invoices) {

            if (invoice.getCreatedDate() == null) {
                continue;
            }

            Map<String, Object> activity =
                    new HashMap<>();

            activity.put(
                    "id",
                    "invoice-" + invoice.getId()
            );

            activity.put(
                    "type",
                    "INVOICE"
            );

            activity.put(
                    "icon",
                    "📄"
            );

            activity.put(
                    "title",
                    "Invoice Created"
            );

            activity.put(
                    "description",
                    "Invoice created for " +
                            invoice.getClientName() +
                            " - ₹" +
                            String.format(
                                    Locale.ENGLISH,
                                    "%.2f",
                                    invoice.getTotalAmount() != null
                                            ? invoice.getTotalAmount()
                                            : 0.0
                            )
            );

            activity.put(
                    "date",
                    invoice.getCreatedDate()
            );

            activityItems.add(
                    new ActivityItem(
                            invoice.getCreatedDate(),
                            activity
                    )
            );
        }

        for (EmailHistory email : emailHistoryList) {

            if (email.getSentDate() == null) {
                continue;
            }

            Map<String, Object> activity =
                    new HashMap<>();

            activity.put(
                    "id",
                    "email-" + email.getId()
            );

            activity.put(
                    "type",
                    "EMAIL"
            );

            activity.put(
                    "icon",
                    "📧"
            );

            activity.put(
                    "title",
                    "Email Sent"
            );

            activity.put(
                    "description",
                    "Email sent to " +
                            email.getToEmail() +
                            " - " +
                            email.getSubject()
            );

            activity.put(
                    "date",
                    email.getSentDate()
            );

            activityItems.add(
                    new ActivityItem(
                            email.getSentDate(),
                            activity
                    )
            );
        }

        for (Schedule schedule : schedules) {

            if (
                    schedule.getScheduleDate() == null ||
                    schedule.getScheduleTime() == null
            ) {
                continue;
            }

            LocalDateTime scheduleDateTime =
                    LocalDateTime.of(
                            schedule.getScheduleDate(),
                            schedule.getScheduleTime()
                    );

            Map<String, Object> activity =
                    new HashMap<>();

            activity.put(
                    "id",
                    "schedule-" + schedule.getId()
            );

            activity.put(
                    "type",
                    "SCHEDULE"
            );

            activity.put(
                    "icon",
                    "📅"
            );

            activity.put(
                    "title",
                    "Schedule Added"
            );

            activity.put(
                    "description",
                    schedule.getTitle() +
                            " scheduled for " +
                            schedule.getScheduleDate() +
                            " at " +
                            schedule.getScheduleTime()
            );

            activity.put(
                    "date",
                    scheduleDateTime
            );

            activityItems.add(
                    new ActivityItem(
                            scheduleDateTime,
                            activity
                    )
            );
        }

        activityItems.sort(
                Comparator.comparing(
                        ActivityItem::getDate
                ).reversed()
        );

        List<Map<String, Object>> recentActivities =
                activityItems.stream()
                        .limit(8)
                        .map(
                                ActivityItem::getActivity
                        )
                        .toList();

        /*
         * ==========================
         * UPCOMING NOTIFICATIONS
         * ==========================
         */

        List<Schedule> upcomingSchedules =
                scheduleRepository
                        .findByScheduleDateGreaterThanEqualOrderByScheduleDateAscScheduleTimeAsc(
                                today
                        );

        List<Map<String, Object>> notifications =
                new ArrayList<>();

        for (Schedule schedule : upcomingSchedules) {

            if (
                    schedule.getScheduleDate() == null ||
                    schedule.getScheduleTime() == null
            ) {
                continue;
            }

            Map<String, Object> notification =
                    new HashMap<>();

            notification.put(
                    "id",
                    schedule.getId()
            );

            notification.put(
                    "title",
                    schedule.getTitle()
            );

            notification.put(
                    "description",
                    schedule.getDescription()
            );

            notification.put(
                    "date",
                    schedule.getScheduleDate()
            );

            notification.put(
                    "time",
                    schedule.getScheduleTime()
            );

            notification.put(
                    "isToday",
                    schedule.getScheduleDate()
                            .equals(today)
            );

            notifications.add(notification);

            if (notifications.size() == 5) {
                break;
            }
        }

        long todayScheduleCount =
                schedules.stream()
                        .filter(schedule ->
                                schedule.getScheduleDate() != null &&
                                schedule.getScheduleDate()
                                        .equals(today)
                        )
                        .count();

        Map<String, Object> nextSchedule = null;

        if (!notifications.isEmpty()) {
            nextSchedule = notifications.get(0);
        }

        /*
         * ==========================
         * RESPONSE DATA
         * ==========================
         */

        data.put(
                "customers",
                customerCount
        );

        data.put(
                "invoices",
                invoiceCount
        );

        data.put(
                "emails",
                emailCount
        );

        data.put(
                "schedules",
                scheduleCount
        );

        data.put(
                "totalRevenue",
                totalRevenue
        );

        data.put(
                "averageInvoiceValue",
                averageInvoiceValue
        );

        data.put(
                "currentMonthRevenue",
                currentMonthRevenue
        );

        data.put(
                "highestInvoice",
                highestInvoiceData
        );

        data.put(
                "topCustomer",
                topCustomerData
        );

        data.put(
                "monthlyRevenue",
                monthlyRevenue
        );

        data.put(
                "monthlyInvoiceCount",
                monthlyInvoiceCount
        );

        data.put(
                "recentActivities",
                recentActivities
        );

        data.put(
                "notifications",
                notifications
        );

        data.put(
                "notificationCount",
                notifications.size()
        );

        data.put(
                "todayScheduleCount",
                todayScheduleCount
        );

        data.put(
                "nextSchedule",
                nextSchedule
        );

        return data;
    }

    private static class ActivityItem {

        private final LocalDateTime date;

        private final Map<String, Object> activity;

        public ActivityItem(
                LocalDateTime date,
                Map<String, Object> activity
        ) {
            this.date = date;
            this.activity = activity;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public Map<String, Object> getActivity() {
            return activity;
        }
    }
}