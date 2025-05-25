package com.tecnoinf.tsig.stn.dto;

import java.time.LocalTime;

public record StopLineRequest(
        Long stopId,
        Long lineId,
        LocalTime estimatedTime
) {
}