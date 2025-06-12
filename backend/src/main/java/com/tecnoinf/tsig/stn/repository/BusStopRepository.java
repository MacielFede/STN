package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusStopRepository extends JpaRepository<BusStop, Long> {
}
