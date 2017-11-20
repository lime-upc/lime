#!/bin/bash
export DOCKER_KAFKA_HOST=$(ip route get 8.8.8.8 | awk '{print $NF; exit}')
docker-compose up -d || echo "HEY, RUN ME AS SUDO :("
