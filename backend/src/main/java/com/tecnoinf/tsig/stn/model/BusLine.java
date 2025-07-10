package com.tecnoinf.tsig.stn.model;

import com.tecnoinf.tsig.stn.enums.LineStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Geometry;

import java.sql.Time;

@Entity
@Table(name = "ft_bus_line")
@Setter
@Getter
public class BusLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String number;

    @Column(nullable = true)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LineStatus status;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Time schedule;

    @Column(columnDefinition = "geometry(LineString, 4326)", nullable = false)
    private Geometry geometry;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
