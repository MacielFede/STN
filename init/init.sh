#!/bin/sh
set e
#PostGIS data initializer
until pg_isready -h postgis -p 5432 -U "$POSTGRES_USER"; do
  echo "Waiting for PostGIS initialization..."
  sleep 2
done

sh /init/load-data.sh
