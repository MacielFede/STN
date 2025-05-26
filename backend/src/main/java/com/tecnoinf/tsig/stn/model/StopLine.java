package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Time;

@Entity
@Table(name = "stop_line",
        uniqueConstraints = @UniqueConstraint(columnNames = {"idStop", "idBusLine", "estimatedTime"}))
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