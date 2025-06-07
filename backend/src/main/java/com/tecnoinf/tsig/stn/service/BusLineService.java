package com.tecnoinf.tsig.stn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.tecnoinf.tsig.stn.dto.BusLineResponse;
import com.tecnoinf.tsig.stn.dto.BusLineRequest;
import com.tecnoinf.tsig.stn.model.BusLine;
import com.tecnoinf.tsig.stn.model.Company;
import com.tecnoinf.tsig.stn.repository.BusLineRepository;
import com.tecnoinf.tsig.stn.repository.CompanyRepository;
import org.geotools.geojson.geom.GeometryJSON;
import org.locationtech.jts.geom.Geometry;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusLineService {
    private final BusLineRepository busLineRepository;
    private final CompanyRepository companyRepository;

    public BusLineService(BusLineRepository busLineRepository, CompanyRepository companyRepository) {
        this.busLineRepository = busLineRepository;
        this.companyRepository = companyRepository;
    }

    public BusLineResponse create(BusLineRequest busLineRequest) {
        Company company = companyRepository.findById(busLineRequest.companyId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        BusLine busLine = new BusLine();

        mapRequestToBusLine(busLine, company, busLineRequest);
        BusLine savedBusLine = busLineRepository.save(busLine);

        return mapToResponse(savedBusLine);
    }

    public BusLineResponse update(Long id, BusLineRequest busLineRequest) {
        Company company = companyRepository.findById(busLineRequest.companyId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));
        BusLine busLine = busLineRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus line not found"));

        mapRequestToBusLine(busLine, company, busLineRequest);
        BusLine updatedBusLine = busLineRepository.save(busLine);

        return mapToResponse(updatedBusLine);
    }

    public void delete(Long id) {
        if (!busLineRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bus line not found");
        }
        busLineRepository.deleteById(id);
    }

    public List<BusLineResponse> findAll() {
        return busLineRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void mapRequestToBusLine(BusLine busLine, Company company, BusLineRequest busLineRequest) {
        busLine.setNumber(busLineRequest.number());
        busLine.setStatus(busLineRequest.status());
        busLine.setOrigin(busLineRequest.origin());
        busLine.setDestination(busLineRequest.destination());
        busLine.setSchedule(busLineRequest.schedule());
        busLine.setGeometry(parseGeometry(busLineRequest.geometry()));
        busLine.setCompany(company);
    }

    private BusLineResponse mapToResponse(BusLine busLine) {
        return new BusLineResponse(
                busLine.getId(),
                busLine.getNumber(),
                busLine.getStatus(),
                busLine.getOrigin(),
                busLine.getDestination(),
                busLine.getSchedule(),
                busLine.getCompany().getId()
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
