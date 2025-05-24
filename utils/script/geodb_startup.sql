-- Active: 1747459323776@@127.0.0.1@5433@geodb
--enums
CREATE TYPE stop_status AS ENUM ('active', 'inactive', 'under_maintenance');

CREATE TYPE line_status AS ENUM ('active', 'inactive');

-- company

CREATE  TABLE if not exists   company (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- ft_stop
CREATE  TABLE if not exists ft_bus_stop (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status stop_status NOT NULL,
    sheltered BOOLEAN DEFAULT FALSE,
    geom GEOMETRY (POINT, 4326)
);

-- bus_line
CREATE  TABLE if not exists bus_line (
    id SERIAL PRIMARY KEY,
    number TEXT NOT NULL,
    status line_status NOT NULL,
    company_id INT REFERENCES company (id)
);

-- stop_line | MANY-TO-MANY entre parada y línea
CREATE  TABLE if not exists stop_line (
    bus_stop_id INT REFERENCES ft_bus_stop (id) ON DELETE CASCADE,
    bus_line_id INT REFERENCES bus_line (id) ON DELETE CASCADE,
    PRIMARY KEY (bus_stop_id, bus_line_id)
);

-- ft_route (una línea puede tener uno o más recorridos según dirección)
CREATE  TABLE if not exists ft_route (
    id SERIAL PRIMARY KEY,
    bus_line_id INT REFERENCES bus_line (id),
    direction TEXT,
    geom GEOMETRY (LINESTRING, 4326)
);

-- line_schedule (horarios por parada y recorrido)
create TABLE if not exists line_schedule (
    id SERIAL PRIMARY KEY,
    route_id INT REFERENCES ft_route (id) ON DELETE CASCADE,
    bus_stop_id INT REFERENCES ft_bus_stop (id) ON DELETE CASCADE,
    operating_day DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME
);

INSERT INTO ft_bus_stop (name, description, status, sheltered, geom) 
VALUES ('Paradita2', 'Bvar y algo', 'active', TRUE, ST_SetSRID(ST_MakePoint( -56.1645, -34.9011), 4326)) 
RETURNING id;
