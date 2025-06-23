CREATE TABLE IF NOT EXISTS public.ft_kilometer_post (
    id SERIAL PRIMARY KEY,
    route NUMERIC(9, 0),
    route_name TEXT,
    kilometer NUMERIC(9, 0),
    geom geometry(Point, 4326)
);