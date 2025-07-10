package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.LineStatus;

import java.sql.Time;

public record BusLineResponse(
        Long id,
        String number,
        String description,
        LineStatus status,
        String origin,
        String destination,
        Time schedule,
        Long companyId
) { }
