package com.tecnoinf.tsig.stn.service;

import com.tecnoinf.tsig.stn.dto.StopRequest;
import com.tecnoinf.tsig.stn.dto.StopResponse;
import com.tecnoinf.tsig.stn.enums.StopStatus;
import com.tecnoinf.tsig.stn.utils.ResourceAlreadyExistsException;
import com.tecnoinf.tsig.stn.utils.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StopService {

    private final JdbcTemplate jdbcTemplate;

    public StopResponse create(StopRequest stopRequest) {
        if (existWithName(stopRequest.getName())) {
            throw new ResourceAlreadyExistsException("Ya existe una parada con el nombre " + stopRequest.getName());
        }

        String sql = "INSERT INTO ft_stops (name, description, status, shelter, geom) " +
                "VALUES (?, ?, ?::text, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)) RETURNING id";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, stopRequest.getName());
            ps.setString(2, stopRequest.getDescription());
            ps.setString(3, stopRequest.getStatus().toString());
            ps.setBoolean(4, stopRequest.getShelter());
            ps.setDouble(5, stopRequest.getLongitude());
            ps.setDouble(6, stopRequest.getLatitude());
            return ps;
        }, keyHolder);

        Number id = keyHolder.getKey();
        if (id == null) {
            throw new DataAccessException("No se pudo obtener el ID de la parada creada") {};
        }

        return StopResponse.builder()
                .id(id.intValue())
                .name(stopRequest.getName())
                .description(stopRequest.getDescription())
                .status(stopRequest.getStatus())
                .shelter(stopRequest.getShelter())
                .latitude(stopRequest.getLatitude())
                .longitude(stopRequest.getLongitude())
                .build();
    }

    public StopResponse getById(Integer id) {
        String sql = "SELECT id, name, description, status, shelter, ST_Y(geom) AS latitude, ST_X(geom) AS longitude FROM ft_stops WHERE id = ?";
        return jdbcTemplate.query(sql, stopRowMapper, id )
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Parada con ID " + id + " no encontrada"));
    }

    public List<StopResponse> getAll() {
        String sql = "SELECT id, name, description, status, shelter, ST_Y(geom) AS latitude, ST_X(geom) AS longitude FROM ft_stops";
        return jdbcTemplate.query(sql, stopRowMapper);
    }

    public void delete(Integer id) {
        String checkSql = "SELECT COUNT(*) FROM ft_stops WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException("No existe una parada con ID " + id);
        }

        String deleteSql = "DELETE FROM ft_stops WHERE id = ?";
        jdbcTemplate.update(deleteSql, id);
    }

    public StopResponse update(Integer id, StopRequest request) {
        String checkSql = "SELECT COUNT(*) FROM ft_stops WHERE id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
        if (count == null || count == 0) {
            throw new ResourceNotFoundException("No existe una parada con ID " + id);
        }

        String updateSql = "UPDATE ft_stops SET name = ?, description = ?, status = ?::text, shelter = ?, geom = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?";

        jdbcTemplate.update(updateSql,
            request.getName(),
            request.getDescription(),
            request.getStatus().toString(),
            request.getShelter(),
            request.getLongitude(),
            request.getLatitude(),
            id
        );

        return getById(id);
    }

    private final RowMapper<StopResponse> stopRowMapper = (rs, rowNum) -> StopResponse.builder()
            .id(rs.getInt("id"))
            .name(rs.getString("name"))
            .description(rs.getString("description"))
            .status(StopStatus.valueOf(rs.getString("status")))
            .shelter(rs.getBoolean("shelter"))
            .latitude(rs.getDouble("latitude"))
            .longitude(rs.getDouble("longitude"))
            .build();

    private boolean existWithName(String name) {
        String sql = "SELECT COUNT(*) FROM ft_stops WHERE LOWER(name) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, name);
        return count != null && count > 0;
    }
}
