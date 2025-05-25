package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import lombok.Data;

import java.sql.Time;

@Data
public class StopLine {
    @EmbeddedId
    private StopLineId id = new StopLineId();

    @ManyToOne
    @MapsId("busStopId")
    @JoinColumn(name = "idStop")
    private BusStop busStop;

    @ManyToOne
    @MapsId("busLineId")
    @JoinColumn(name = "idBusLine")
    private BusLine busLine;

    private Time estimatedTime;
}
