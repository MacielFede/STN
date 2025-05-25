package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.BusLineSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusLineScheduleRepository extends JpaRepository<BusLineSchedule, Long> {
}
