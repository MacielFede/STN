package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.Direction;
import com.tecnoinf.tsig.stn.enums.StopStatus;

public record BusStopResponse(
        Long id,
        String name,
        String description,
        Direction direction,
        String department,
        String route,
        StopStatus status,
        Boolean hasShelter
    ) { }
