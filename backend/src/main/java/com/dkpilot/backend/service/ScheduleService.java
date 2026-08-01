package com.dkpilot.backend.service;

import com.dkpilot.backend.entity.Schedule;
import com.dkpilot.backend.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleRepository scheduleRepository;

    public Schedule addSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository
                .findById(id)
                .orElse(null);
    }

    public Schedule updateSchedule(
            Long id,
            Schedule schedule
    ) {
        Schedule existingSchedule =
                scheduleRepository
                        .findById(id)
                        .orElse(null);

        if (existingSchedule == null) {
            return null;
        }

        existingSchedule.setTitle(
                schedule.getTitle()
        );

        existingSchedule.setDescription(
                schedule.getDescription()
        );

        existingSchedule.setScheduleDate(
                schedule.getScheduleDate()
        );

        existingSchedule.setScheduleTime(
                schedule.getScheduleTime()
        );

        return scheduleRepository.save(
                existingSchedule
        );
    }

    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}