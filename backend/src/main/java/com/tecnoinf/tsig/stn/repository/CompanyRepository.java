package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}