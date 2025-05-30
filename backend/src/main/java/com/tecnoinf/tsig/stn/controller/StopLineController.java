package com.tecnoinf.tsig.stn.controller;

import com.tecnoinf.tsig.stn.dto.StopLineRequest;
import com.tecnoinf.tsig.stn.dto.StopLineResponse;
import com.tecnoinf.tsig.stn.service.StopLineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Time;
import java.util.List;

@RestController
@RequestMapping("api/stop-lines")
public class StopLineController {

    private final StopLineService stopLineService;

    public StopLineController(StopLineService stopLineService) {
        this.stopLineService = stopLineService;
    }

    @PostMapping
    public ResponseEntity<StopLineResponse> create(@RequestBody StopLineRequest request) {
        return ResponseEntity.ok(stopLineService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StopLineResponse> update(@PathVariable Long id, @RequestBody StopLineRequest request) {
        return ResponseEntity.ok(stopLineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stopLineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<StopLineResponse>> getAll() {
        return ResponseEntity.ok(stopLineService.findAll());
    }

    @GetMapping("/by-stop/{stopId}")
    public ResponseEntity<List<StopLineResponse>> getByStopId(@PathVariable Long stopId) {
        return ResponseEntity.ok(stopLineService.findByStopId(stopId));
    }

    @GetMapping("/by-line/{lineId}")
    public ResponseEntity<List<StopLineResponse>> getByLineId(@PathVariable Long lineId) {
        return ResponseEntity.ok(stopLineService.findByLineId(lineId));
    }

    @GetMapping("/{stopId}/time-range")
    public ResponseEntity<List<StopLineResponse>> findByStopAndEstimatedTimeRange(
            @PathVariable Long stopId,
            @RequestParam Time startTime,
            @RequestParam Time endTime) {
        return ResponseEntity.ok(stopLineService.findByStopAndEstimatedTimeRange(stopId, startTime, endTime));
    }
}
