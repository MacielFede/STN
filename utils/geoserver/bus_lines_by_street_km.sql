SELECT 
DISTINCT ON (bl.id) bl.*
FROM ft_bus_line bl
JOIN ft_kilometer_post k 
  ON ST_Intersects(
       bl.geometry,
       ST_Buffer(k.geom::geography,
200)::geometry)
WHERE 
  k.route_name = '%street_name%'
  AND k.kilometer = CAST(NULLIF('%km_value%', '') AS numeric)
ORDER BY bl.id

