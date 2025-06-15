SELECT DISTINCT ON (bl.id) bl.* FROM ft_bus_line bl JOIN ft_street s ON ST_Intersects(bl.geometry, ST_Buffer(s.geom::geography, 10)::geometry) WHERE s.street_code = '%st_code%' ORDER BY bl.id
