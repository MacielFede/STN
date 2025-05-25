package com.tecnoinf.tsig.stn.service;

import org.geotools.geojson.geom.GeometryJSON;
import org.locationtech.jts.geom.Geometry;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BusStopService {

    private final BusStopRepository busStopRepository;

    public BusStopService(BusStopRepository busStopRepository) {
        this.busStopRepository = busStopRepository;
    }

    public BusStopResponse create(BusStopRequest busStopRequest) {
        BusStop busStopSaved = saveBusStop(busStopRequest, Optional.empty());

        return mapBusStopResponse(busStopSaved);
    }

    public BusStopResponse update(Long id, BusStopRequest busStopRequest) {
        busStopRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus stop not found"));
        BusStop busStopUpdated = saveBusStop(busStopRequest, Optional.of(id));

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

    private BusStop saveBusStop(BusStopRequest busStopRequest, Optional<Long> busStopId) {
        Geometry geometry = parseGeometry(busStopRequest.geometry());

        BusStop busStop = new BusStop();
        busStop.setName(busStopRequest.name());
        busStop.setDescription(busStopRequest.description());
        busStop.setStatus(busStopRequest.status());
        busStop.setHasShelter(busStopRequest.hasShelter());
        busStop.setGeometry(geometry);
        if (busStopId.isPresent()) {
            busStop.setId(busStopId.get());
        }
        return busStopRepository.save(busStop);
    }

    private BusStopResponse mapBusStopResponse(BusStop busStop) {
        return new BusStopResponse(
                busStop.getId(),
                busStop.getName(),
                busStop.getDescription(),
                busStop.getStatus(),
                busStop.getHasShelter(),
                busStop.getGeometry());
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