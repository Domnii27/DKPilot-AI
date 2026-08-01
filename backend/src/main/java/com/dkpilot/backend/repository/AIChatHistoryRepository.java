package com.dkpilot.backend.repository;

import com.dkpilot.backend.entity.AIChatHistory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIChatHistoryRepository
        extends JpaRepository<AIChatHistory, Long> {

    List<AIChatHistory>
    findByUserEmailOrderByCreatedDateDesc(
            String userEmail
    );
}