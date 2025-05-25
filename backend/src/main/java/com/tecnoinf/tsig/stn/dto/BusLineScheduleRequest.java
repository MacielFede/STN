package com.tecnoinf.tsig.stn.dto;

import java.sql.Date;
import java.sql.Time;

public record BusLineScheduleRequest(
         Date operatingDay,
         Time departureTime,
         Time arrivalTime
) {
}
