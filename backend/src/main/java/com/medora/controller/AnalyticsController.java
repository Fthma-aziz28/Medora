package com.medora.controller;

import com.medora.dao.*;
import com.medora.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private DepartmentDao deptDao;
    @Autowired private DoctorDao docDao;
    @Autowired private AppointmentDao apptDao;

    @GetMapping("/department-coverage")
    public List<Map<String, Object>> getDepartmentCoverage() {
        List<Doctor> allDocs = docDao.findAll();
        return deptDao.findAll().stream().map(dept -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", dept.getName());
            long assigned = allDocs.stream().filter(d -> d.getDepartmentId() != null && d.getDepartmentId().equals(dept.getId())).count();
            map.put("assigned", assigned * 40); // mock hours
            map.put("required", (assigned + 1) * 40);
            map.put("gap", 40);
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/duty-distribution")
    public List<Map<String, Object>> getDutyDistribution() {
        List<Map<String, Object>> res = new ArrayList<>();
        res.add(Map.of("name", "Scheduled", "value", 12));
        res.add(Map.of("name", "Completed", "value", 20));
        res.add(Map.of("name", "Unfilled", "value", 5));
        res.add(Map.of("name", "Cancelled", "value", 2));
        return res;
    }
    
    @GetMapping("/weekly-trends")
    public List<Map<String, Object>> getWeeklyTrends() {
        List<Map<String, Object>> res = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for(String d : days) {
            res.add(Map.of("name", d, "Scheduled", 15, "Completed", 12, "Unfilled", 3));
        }
        return res;
    }
}
