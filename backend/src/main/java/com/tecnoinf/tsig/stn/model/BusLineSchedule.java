package com.tecnoinf.tsig.stn.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;

@Entity
@Table(name = "bus_line_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusLineSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private Date operating_day;
    @Column(nullable = false)
    private Time departure_time;
    @Column(nullable = false)
    private Time arrival_time;
}
