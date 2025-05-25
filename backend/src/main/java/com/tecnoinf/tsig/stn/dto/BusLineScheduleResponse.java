package com.tecnoinf.tsig.stn.dto;

import java.sql.Date;
import java.sql.Time;

public record BusLineScheduleResponse(
        Long id,
        Date operatingDay,
        Time departureTime,
        Time arrivalTime
) { }
