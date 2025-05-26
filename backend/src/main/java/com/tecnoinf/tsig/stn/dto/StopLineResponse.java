package com.tecnoinf.tsig.stn.dto;

import java.sql.Time;

public record StopLineResponse(
        Long stopId,
        Long lineId,
        Time estimatedTime
) {}