# Sistema de Transporte Nacional (STN) 

This project was developed for a GIS course, utilizing various tools and technologies. 
The application is designed to interact with GIS data, providing functionality through PostGIS and GeoServer, a backend with SpringBoot and a user interface with React and Leaflet.

## Requirements

- Docker
- Docker compose

## Run

To start the project, use Docker Compose to set up the environment:
```bash
docker compose up -d
```
If you make any changes, you'll need to re-build the project:

```bash
docker compose down backend && docker compose build backend --no-cache && docker compose up backend -d 
docker compose down frontend && docker compose build frontend && docker compose up frontend -d
```

Geoserver will run in the port 8000

Postgres will run in the port 5433

FrontEnd application will run in the port 3000

BackEnd application will run in the port 8080

## Load geoserver config 

```bash
docker cp urils/geoserver/web.xml <container_name_or_id>:/usr/local/tomcat/webapps/geoserver/WEB-INF/web.xml
docker cp utils/geoserver/web.xml <container_name_or_id>:/usr/local/tomcat/conf/web.xml
```
## Public geoserver tables

To be able to use the frontend fully, you'll need to publish this tables on geoserver under the workspace defined in `GEO_WORKSPACE` in the file `frontend/src/utils/constants.ts`

1. ft_bus_stop
2. ft_street -> this table should be added using the script created by Martin
3. ft_bus_line
4. bus_lines_in_streets -> This is a stored view that you have to add following this guide https://docs.geoserver.org/main/en/user/data/database/sqlview.html and using the script at `utils/geoserver/bus_lines_by_street.sql` 
