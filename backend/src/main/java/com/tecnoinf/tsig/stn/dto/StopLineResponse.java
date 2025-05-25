package com.tecnoinf.tsig.stn.dto;

import java.time.LocalTime;

public record StopLineResponse(
        Long stopId,
        Long lineId,
        LocalTime estimatedTime
) {}