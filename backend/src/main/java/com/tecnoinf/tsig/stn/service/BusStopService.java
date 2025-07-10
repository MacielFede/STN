package com.tecnoinf.tsig.stn.service;

import org.geotools.geojson.geom.GeometryJSON;
import org.locationtech.jts.geom.Geometry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnoinf.tsig.stn.dto.BusStopRequest;
import com.tecnoinf.tsig.stn.dto.BusStopResponse;
import com.tecnoinf.tsig.stn.model.BusStop;
import com.tecnoinf.tsig.stn.repository.BusStopRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusStopService {

    private final BusStopRepository busStopRepository;

    public BusStopService(BusStopRepository busStopRepository) {
        this.busStopRepository = busStopRepository;
    }

    public BusStopResponse create(BusStopRequest busStopRequest) {
        BusStop busStop = new BusStop();
        mapRequestToBusStop(busStop, busStopRequest);

        BusStop busStopSaved = busStopRepository.save(busStop);
        return mapBusStopResponse(busStopSaved);
    }

    public BusStopResponse update(Long id, BusStopRequest busStopRequest) {
        BusStop busStop = busStopRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found"));
        mapRequestToBusStop(busStop, busStopRequest);

        BusStop busStopUpdated = busStopRepository.save(busStop);

        return mapBusStopResponse(busStopUpdated);
    }

    public void delete(Long id) {
        if (!busStopRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found");

        busStopRepository.deleteById(id);
    }

    public List<BusStopResponse> findAll() {
        return busStopRepository.findAll().stream().map(this::mapBusStopResponse).collect(Collectors.toList());
    }

    public List<BusStopResponse> findById(Long id) {
        return busStopRepository.findById(id).stream().map(this::mapBusStopResponse).collect(Collectors.toList());
    }

    private void mapRequestToBusStop(BusStop busStop, BusStopRequest busStopRequest) {
        busStop.setName(busStopRequest.name());
        busStop.setDescription(busStopRequest.description());
        busStop.setDirection(busStopRequest.direction());
        busStop.setDepartment(busStopRequest.department());
        busStop.setRoute(busStopRequest.route());
        busStop.setStatus(busStopRequest.status());
        busStop.setHasShelter(busStopRequest.hasShelter());
        busStop.setGeometry(parseGeometry(busStopRequest.geometry()));
    }

    private BusStopResponse mapBusStopResponse(BusStop busStop) {
        return new BusStopResponse(
                busStop.getId(),
                busStop.getName(),
                busStop.getDescription(),
                busStop.getDirection(),
                busStop.getDepartment(),
                busStop.getRoute(),
                busStop.getStatus(),
                busStop.getHasShelter()
        );
    }

    private Geometry parseGeometry(JsonNode geoJson) {
        GeometryJSON geometryJSON = new GeometryJSON();
        try (StringReader reader = new StringReader(geoJson.toString())) {
            return geometryJSON.read(reader);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GeoJSON format");
        }
    }
}