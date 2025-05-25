package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.StopLine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StopLineRepository extends JpaRepository<StopLine, Long> {
}