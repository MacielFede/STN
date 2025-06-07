package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.LineStatus;

public record BusLineResponse(
        Long id,
        String number,
        LineStatus status,
        String origin,
        String destination,
        Long companyId
) { }
