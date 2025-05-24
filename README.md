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
docker-compose build --no-cache && docker compose up -d 
```

Geoserver will run in the port 80

Postgres will run in the port 5432

FrontEnd application will run in the port 5173

BackEnd application will run in the port 8080
