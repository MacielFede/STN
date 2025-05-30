package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.StopLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Time;
import java.util.List;

public interface StopLineRepository extends JpaRepository<StopLine, Long> {
    boolean existsByBusStopIdAndBusLineIdAndEstimatedTime(Long busStopId, Long busLineId, Time estimatedTime);

    List<StopLine> findByBusStopId(Long stopId);

    List<StopLine> findByBusStopIdAndEstimatedTimeBetween(Long stopId, Time from, Time to);
}