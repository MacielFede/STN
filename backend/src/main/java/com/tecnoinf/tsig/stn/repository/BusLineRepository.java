package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.BusLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusLineRepository extends JpaRepository<BusLine, Long> {
    boolean existsByCompanyId(Long companyId);
}
