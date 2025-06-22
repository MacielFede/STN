package com.tecnoinf.tsig.stn.dto;

import java.sql.Time;

public record StopLineResponse(
        Long id,
        Long stopId,
        Long lineId,
        Time estimatedTime,
        Boolean isEnabled
) {}