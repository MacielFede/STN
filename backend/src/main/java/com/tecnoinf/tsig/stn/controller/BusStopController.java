package com.tecnoinf.tsig.stn.controller;

import com.tecnoinf.tsig.stn.dto.BusStopRequest;
import com.tecnoinf.tsig.stn.dto.BusStopResponse;
import com.tecnoinf.tsig.stn.service.BusStopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bus-stops")
public class BusStopController {
    private final BusStopService busStopService;

    public BusStopController(BusStopService busStopService) {
        this.busStopService = busStopService;
    }

    @PostMapping
    public ResponseEntity<BusStopResponse> create(@Valid @RequestBody BusStopRequest request) {
        return ResponseEntity.ok(busStopService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody BusStopRequest request) {
        return ResponseEntity.ok(busStopService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        busStopService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping()
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(busStopService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(busStopService.findById(id));
    }

}
