package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.StopStatus;
import org.locationtech.jts.geom.Geometry;

public record BusStopResponse(
        Long id,
        String name,
        String description,
        StopStatus status,
        Boolean shelter,
        Geometry geometry
    ) { }
