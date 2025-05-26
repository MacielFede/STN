package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StopLineId implements Serializable {

    private Long busStopId;
    private Long busLineId;
}