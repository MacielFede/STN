package com.tecnoinf.tsig.stn.model;

import com.tecnoinf.tsig.stn.enums.StopStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "ft_bus_stop")

@Getter
@Setter
public class BusStop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = true)
    private String description;
    @Enumerated(EnumType.STRING)
    private StopStatus status;
    @Column(nullable = false)
    private Boolean hasShelter;
    @Column(columnDefinition = "geometry(Point, 4326)", nullable = false)
    private Geometry geometry;
}
