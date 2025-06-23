package com.tecnoinf.tsig.stn.dto;

import java.sql.Time;

public record StopLineRequest(
        Long stopId,
        Long lineId,
        Time estimatedTime,
        Boolean isEnabled
) { }