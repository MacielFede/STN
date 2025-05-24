package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.StopStatus;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class StopRequest {
    private Integer id;
    
    @NotBlank(message = "El nombre es obligatorio")
    private String name;
    
    private String description;
    
    @NotNull(message = "El status es obligatorio")
    private StopStatus status;
    
    @NotNull(message = "Debe indicar si la parada está resguardada")
    private Boolean shelter;
    
    @NotNull(message = "La latitud es obligatoria")
    private Double latitude;
    
    @NotNull(message = "La longitud es obligatoria")
    private Double longitude;
}
