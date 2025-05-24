package com.tecnoinf.tsig.stn.dto;

import com.tecnoinf.tsig.stn.enums.StopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StopResponse {
    private Integer id;
    private String name;
    private String description;
    private StopStatus status;
    private Boolean shelter;
    private Double latitude;
    private Double longitude;
}
