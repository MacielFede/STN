package com.tecnoinf.tsig.stn.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.tecnoinf.tsig.stn.enums.StopStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BusStopRequest(
        @NotBlank(message = "Name is required") String name,
        String description,
        @NotNull(message = "Direction is required") String direction,
        @NotNull(message = "Department is required") String department,
        @NotNull(message = "Route is required") String route,
        @NotNull(message = "Status is required") StopStatus status,
        @NotNull(message = "You must indicate whether the stop is sheltered") Boolean hasShelter,
        @NotNull(message = "Geometry is required") JsonNode geometry
) {
}
