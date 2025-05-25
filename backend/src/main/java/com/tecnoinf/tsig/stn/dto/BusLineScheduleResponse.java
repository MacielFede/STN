package com.tecnoinf.tsig.stn.dto;

import java.sql.Date;
import java.sql.Time;

public record BusLineScheduleResponse(
        Long id,
        Date operating_day,
        Time departure_time,
        Time arrival_time
) { }
