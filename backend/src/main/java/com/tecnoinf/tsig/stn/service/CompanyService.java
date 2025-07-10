package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.CompanyRequest;
import com.tecnoinf.tsig.stn.dto.CompanyResponse;
import com.tecnoinf.tsig.stn.model.Company;
import com.tecnoinf.tsig.stn.repository.BusLineRepository;
import com.tecnoinf.tsig.stn.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final BusLineRepository busLineRepository;

    public CompanyService(CompanyRepository companyRepository, BusLineRepository busLineRepository) {
        this.companyRepository = companyRepository;
        this.busLineRepository = busLineRepository;
    }

    public CompanyResponse create(CompanyRequest request) {
        Company company = new Company();
        company.setName(request.name());
        Company savedCompany = companyRepository.save(company);

        return new CompanyResponse(savedCompany.getId(), savedCompany.getName());
    }

    public List<CompanyResponse> findAll() {
        return companyRepository.findAll().stream().map(company -> new CompanyResponse(company.getId(), company.getName())).collect(Collectors.toList());
    }

    public CompanyResponse update(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found"));

        company.setName(request.name());
        Company updatedCompany = companyRepository.save(company);

        return new CompanyResponse(updatedCompany.getId(), updatedCompany.getName());
    }

    public void delete(Long id) {
        if (!companyRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Company not found");
        if (busLineRepository.existsByCompanyId(id))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete company with existing bus lines");

        companyRepository.deleteById(id);
    }
}
