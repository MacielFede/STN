# GIS Project

This project was developed for a GIS course, utilizing various tools and technologies. 
The application is designed to interact with GIS data, providing functionality through PostGIS (PostreSQL).

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
sudo docker cp utils/geoserver_data/. <container_name_or_id>:/var/local/geoserver
```

