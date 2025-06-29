CREATE TABLE public.ft_department (
    gid integer,
    name character varying,
    geom public.geometry (MultiLineString, 4326)
);