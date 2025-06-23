#!/bin/sh
echo "----------------------------------------------"
echo "-----------------Loading data-----------------"
echo "----------------------------------------------"

export PGPASSWORD="$POSTGRES_PASSWORD"
sql_files=$(find /init/data -name '*.sql' | sort)
total_files=$(echo "$sql_files" | wc -l)
current=0

for sql_file in /init/data/*.sql; do
  current=$((current + 1))
  percent=$((current * 100 / total_files))

  echo "Runnning $sql_file ($current/$total_files)"
  echo "----------------------------------------------"
  psql -q -h postgis -U "$POSTGRES_USER" -d "$POSTGRES_DB"  -f "$sql_file"
  echo "[$percent%] of total ($current/$total_files)"
  echo "----------------------------------------------"
done

echo "---------------Loading finished---------------"
echo "----------------------------------------------"
