package com.tecnoinf.tsig.stn.controller;

import com.tecnoinf.tsig.stn.dto.BusLineScheduleRequest;
import com.tecnoinf.tsig.stn.dto.BusLineScheduleResponse;
import com.tecnoinf.tsig.stn.service.BusLineScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bus-line-schedules")
public class BusLineScheduleController {
    private final BusLineScheduleService busLineScheduleService;

    public BusLineScheduleController(BusLineScheduleService busLineScheduleService) {
        this.busLineScheduleService = busLineScheduleService;
    }

    @PostMapping
    public ResponseEntity<BusLineScheduleResponse> create(@Valid @RequestBody BusLineScheduleRequest request) {
        return ResponseEntity.ok(busLineScheduleService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BusLineScheduleResponse>> getAll() {
        return ResponseEntity.ok(busLineScheduleService.findAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusLineScheduleResponse> update(@PathVariable Long id, @Valid @RequestBody BusLineScheduleRequest request) {
        return ResponseEntity.ok(busLineScheduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        busLineScheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
