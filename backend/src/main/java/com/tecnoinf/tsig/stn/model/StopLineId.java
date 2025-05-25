package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class StopLineId implements Serializable {

    private Long busStopId;
    private Long busLineId;
}