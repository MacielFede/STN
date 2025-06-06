package com.tecnoinf.tsig.stn.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.tecnoinf.tsig.stn.enums.LineStatus;
import jakarta.validation.constraints.NotNull;

import java.sql.Time;

public record BusLineRequest(
        @NotNull(message = "Line number is required") String number,
        @NotNull(message = "Line status is required") LineStatus status,
        @NotNull(message = "Line origin is required") String origin,
        @NotNull(message = "Line destination is required") String destination,
        @NotNull(message = "Line schedule is required") Time schedule,
        @NotNull(message = "Geometry is required") JsonNode geometry,
        @NotNull(message = "Line company id is required") Long companyId
) {
}
