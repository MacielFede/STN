package com.tecnoinf.tsig.stn.model;

import com.tecnoinf.tsig.stn.enums.StopStatus;

import lombok.Data;

@Data
public class Stop {
    private Integer id;
    private String name;
    private String description;
    private StopStatus status;
    private Boolean shelter;
}
