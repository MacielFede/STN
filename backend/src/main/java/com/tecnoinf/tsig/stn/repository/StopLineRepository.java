package com.tecnoinf.tsig.stn.repository;

import com.tecnoinf.tsig.stn.model.StopLine;
import com.tecnoinf.tsig.stn.model.StopLineId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Time;
import java.util.List;

public interface StopLineRepository extends JpaRepository<StopLine, StopLineId> {
    boolean existsByBusStopIdAndBusLineIdAndEstimatedTime(Long busStopId, Long busLineId, Time estimatedTime);

    boolean existsByBusStopIdAndBusLineId(Long busStopId, Long busLineId);

    List<StopLine> findByBusStopId(Long stopId);

    List<StopLine> findByBusStopIdAndEstimatedTimeBetween(Long stopId, Time from, Time to);

    void deleteByBusStopIdAndBusLineId(Long busStopId, Long busLineId);
}