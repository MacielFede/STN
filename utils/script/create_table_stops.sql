DROP TABLE IF EXISTS ft_stops;

CREATE TABLE ft_stops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    shelter BOOLEAN NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL
);