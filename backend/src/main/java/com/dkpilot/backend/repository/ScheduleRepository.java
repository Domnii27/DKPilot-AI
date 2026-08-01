package com.dkpilot.backend.repository;

import com.dkpilot.backend.entity.Schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository
        extends JpaRepository<Schedule, Long> {

    List<Schedule> findByScheduleDateGreaterThanEqualOrderByScheduleDateAscScheduleTimeAsc(
            LocalDate scheduleDate
    );
}