package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.StopLineRequest;
import com.tecnoinf.tsig.stn.dto.StopLineResponse;
import com.tecnoinf.tsig.stn.model.BusLine;
import com.tecnoinf.tsig.stn.model.BusStop;
import com.tecnoinf.tsig.stn.model.StopLine;
import com.tecnoinf.tsig.stn.model.StopLineId;
import com.tecnoinf.tsig.stn.repository.BusLineRepository;
import com.tecnoinf.tsig.stn.repository.BusStopRepository;
import com.tecnoinf.tsig.stn.repository.StopLineRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Time;
import java.util.List;
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

        StopLineId id = new StopLineId(request.stopId(), request.lineId());

        stopLineRepository.findById(id).ifPresent(existing -> {
            if (existing.getEstimatedTime().equals(request.estimatedTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "StopLine already exists with same estimated time");
            }
        });

        StopLine stopLine = new StopLine();
        stopLine.setId(id);
        stopLine.setBusStop(stop);
        stopLine.setBusLine(line);
        stopLine.setEstimatedTime(request.estimatedTime());

        StopLine saved = stopLineRepository.save(stopLine);
        return mapToResponse(saved);
    }

    public void delete(Long stopId, Long lineId) {
        StopLineId id = new StopLineId(stopId, lineId);
        if (!stopLineRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "StopLine not found");
        }
        stopLineRepository.deleteById(id);
    }

    public List<StopLineResponse> findAll() {
        return stopLineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    public List<StopLineResponse> findByStopAndEstimatedTimeRange(Long stopId, Time from, Time to) {
        return stopLineRepository.findAll().stream()
                .filter(stopLine ->
                        stopLine.getBusStop().getId().equals(stopId) &&
                                (stopLine.getEstimatedTime().equals(from) || stopLine.getEstimatedTime().after(from)) &&
                                (stopLine.getEstimatedTime().equals(to) || stopLine.getEstimatedTime().before(to))
                )
                .map(this::mapToResponse);
    }

    public List<StopLineResponse> findByStopId(Long stopId) {
        return stopLineRepository.findAll().stream()
                .filter(stopLine -> stopLine.getBusStop().getId().equals(stopId))
                .map(this::mapToResponse);
    }

    private StopLineResponse mapToResponse(StopLine stopLine) {
        return new StopLineResponse(
                stopLine.getBusStop().getId(),
                stopLine.getBusLine().getId(),
                stopLine.getEstimatedTime()
        );
    }
}