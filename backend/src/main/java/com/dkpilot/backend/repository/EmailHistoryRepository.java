package com.dkpilot.backend.repository;

import com.dkpilot.backend.entity.EmailHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailHistoryRepository
        extends JpaRepository<EmailHistory, Long> {

    List<EmailHistory> findByUserEmailOrderBySentDateDesc(
            String userEmail
    );
}