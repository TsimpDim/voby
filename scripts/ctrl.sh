#!/bin/bash
declare -A dcfiles=(
    ["core"]="docker-compose-core.yml"
    ["api"]="voby-api/docker-compose-api.yml"
    ["client"]="voby/docker-compose-client.yml"
)

if [[ $1 == "start" ]]; then
    cmd="up -d"
else
    cmd=$1
fi

if [[ $2 == "all" ]]; then
    for key in "${!dcfiles[@]}"; do
        docker compose -f ${dcfiles[$key]} $cmd
    done
else
    docker compose -f ${dcfiles[$2]} $cmd
fi