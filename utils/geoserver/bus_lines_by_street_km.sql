SELECT 
  bl.*
FROM ft_bus_line bl
JOIN ft_street s 
  ON ST_Intersects(bl.geometry, ST_Buffer(s.geom::geography, 10)::geometry)
LEFT JOIN ft_kilometer_post k 
  ON k.route_name = s.name
     AND (NULLIF('%km_value%', '') IS NULL OR k.kilometer = CAST(NULLIF('%km_value%', '') AS numeric))
WHERE
  s.street_code = '%street_code%'
  AND (
    NULLIF('%km_value%', '') IS NULL
    OR ST_Intersects(
        bl.geometry,
        ST_Buffer(k.geom::geography, 200)::geometry
      )
  )
