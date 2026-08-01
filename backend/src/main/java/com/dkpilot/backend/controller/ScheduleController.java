package com.dkpilot.backend.controller;

import com.dkpilot.backend.entity.Schedule;
import com.dkpilot.backend.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @PostMapping
    public Schedule addSchedule(
            @RequestBody Schedule schedule
    ) {
        return scheduleService.addSchedule(schedule);
    }

    @GetMapping
    public List<Schedule> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public Schedule getScheduleById(
            @PathVariable Long id
    ) {
        return scheduleService.getScheduleById(id);
    }

    @PutMapping("/{id}")
    public Schedule updateSchedule(
            @PathVariable Long id,
            @RequestBody Schedule schedule
    ) {
        return scheduleService.updateSchedule(
                id,
                schedule
        );
    }

    @DeleteMapping("/{id}")
    public String deleteSchedule(
            @PathVariable Long id
    ) {
        scheduleService.deleteSchedule(id);

        return "Schedule deleted successfully";
    }
}