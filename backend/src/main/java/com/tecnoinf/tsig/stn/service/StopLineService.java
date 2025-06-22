package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.StopLineRequest;
import com.tecnoinf.tsig.stn.dto.StopLineResponse;
import com.tecnoinf.tsig.stn.model.BusLine;
import com.tecnoinf.tsig.stn.model.BusStop;
import com.tecnoinf.tsig.stn.model.StopLine;
import com.tecnoinf.tsig.stn.repository.BusLineRepository;
import com.tecnoinf.tsig.stn.repository.BusStopRepository;
import com.tecnoinf.tsig.stn.repository.StopLineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Time;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StopLineService {

    private final StopLineRepository stopLineRepository;
    private final BusStopRepository busStopRepository;
    private final BusLineRepository busLineRepository;

    public StopLineService(StopLineRepository stopLineRepository, BusStopRepository busStopRepository, BusLineRepository busLineRepository) {
        this.stopLineRepository = stopLineRepository;
        this.busStopRepository = busStopRepository;
        this.busLineRepository = busLineRepository;
    }

    public StopLineResponse create(StopLineRequest request) {
        BusStop stop = busStopRepository.findById(request.stopId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found"));

        BusLine line = busLineRepository.findById(request.lineId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus line not found"));

        boolean exists = stopLineRepository.existsByBusStopIdAndBusLineIdAndEstimatedTime(
                request.stopId(), request.lineId(), request.estimatedTime()
        );
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "StopLine already exists with same estimated time");
        }

        StopLine stopLine = new StopLine();
        stopLine.setBusStop(stop);
        stopLine.setBusLine(line);
        stopLine.setEstimatedTime(request.estimatedTime());
        stopLine.setIsEnabled(request.isEnabled());

        StopLine saved = stopLineRepository.save(stopLine);
        return mapToResponse(saved);
    }

    public StopLineResponse update(Long id, StopLineRequest request) {
        StopLine stopLine = stopLineRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StopLine not found"));

        stopLine.setEstimatedTime(request.estimatedTime());
        stopLine.setIsEnabled(request.isEnabled());

        StopLine updated = stopLineRepository.save(stopLine);
        return mapToResponse(updated);
    }

    public void delete(Long stopLineId) {
        StopLine stopLine = stopLineRepository.findById(stopLineId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StopLine not found"));
        stopLineRepository.delete(stopLine);
    }

    public List<StopLineResponse> findAll() {
        return stopLineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StopLineResponse> findByStopAndEstimatedTimeRange(Long stopId, Time from, Time to) {
        return stopLineRepository.findByBusStopIdAndEstimatedTimeBetween(stopId, from, to).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StopLineResponse> findByStopId(Long stopId) {
        return stopLineRepository.findByBusStopId(stopId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StopLineResponse> findByLineId(Long lineId) {
        return stopLineRepository.findAll().stream()
                .filter(stopLine -> stopLine.getBusLine().getId().equals(lineId))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StopLineResponse mapToResponse(StopLine stopLine) {
        return new StopLineResponse(
                stopLine.getId(),
                stopLine.getBusStop().getId(),
                stopLine.getBusLine().getId(),
                stopLine.getEstimatedTime(),
                stopLine.getIsEnabled()
        );
    }
}
