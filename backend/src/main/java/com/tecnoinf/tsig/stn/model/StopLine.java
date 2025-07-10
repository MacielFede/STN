package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Time;

import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "stop_line", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "bus_stop_id", "bus_line_id", "estimated_time" })
})
@Data
public class StopLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bus_stop_id", nullable = false)
    private BusStop busStop;

    @ManyToOne(optional = false)
    @JoinColumn(name = "bus_line_id", nullable = false)
    private BusLine busLine;

    @Column(name = "estimated_time", nullable = false)
    private Time estimatedTime;

    @Column(name = "is_enabled", nullable = false)
    @ColumnDefault(value = "false")
    private Boolean isEnabled;
}