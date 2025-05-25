package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.BusLineScheduleResponse;
import com.tecnoinf.tsig.stn.dto.BusLineScheduleRequest;
import com.tecnoinf.tsig.stn.model.BusLineSchedule;
import com.tecnoinf.tsig.stn.repository.BusLineScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusLineScheduleService {
    private final BusLineScheduleRepository busLineScheduleRepository;

    public BusLineScheduleService(BusLineScheduleRepository busLineScheduleRepository) {
        this.busLineScheduleRepository = busLineScheduleRepository;
    }

    public BusLineScheduleResponse create(BusLineScheduleRequest request) {
        BusLineSchedule busLineSchedule = new BusLineSchedule();
        busLineSchedule.setOperating_day(request.operatingDay());
        busLineSchedule.setDeparture_time(request.departureTime());
        busLineSchedule.setArrival_time(request.arrivalTime());
        BusLineSchedule savedBusLineSchedule = busLineScheduleRepository.save(busLineSchedule);
        return new BusLineScheduleResponse(
                savedBusLineSchedule.getId(),
                savedBusLineSchedule.getOperating_day(),
                savedBusLineSchedule.getDeparture_time(),
                savedBusLineSchedule.getArrival_time()
        );
    }

    public List<BusLineScheduleResponse> findAll() {
        return busLineScheduleRepository.findAll().stream().map(busLineSchedule -> new BusLineScheduleResponse(
                busLineSchedule.getId(),
                busLineSchedule.getOperating_day(),
                busLineSchedule.getDeparture_time(),
                busLineSchedule.getArrival_time()
        )).collect(Collectors.toList());
    }

    public BusLineScheduleResponse update(Long id, BusLineScheduleRequest request) {
        BusLineSchedule busLineSchedule = busLineScheduleRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus line schedule not found"));

        busLineSchedule.setOperating_day(request.operatingDay());
        busLineSchedule.setDeparture_time(request.departureTime());
        busLineSchedule.setArrival_time(request.arrivalTime());
        BusLineSchedule updatedBusLineSchedule = busLineScheduleRepository.save(busLineSchedule);
        return new BusLineScheduleResponse(
                updatedBusLineSchedule.getId(),
                updatedBusLineSchedule.getOperating_day(),
                updatedBusLineSchedule.getDeparture_time(),
                updatedBusLineSchedule.getArrival_time()
        );
    }

    public void delete(Long id) {
        if (!busLineScheduleRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus line schedule not found");

        busLineScheduleRepository.deleteById(id);
    }
}
