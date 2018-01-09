#!/bin/bash

mvn clean install
docker rm transaction-generator
docker rmi elizabbeth/transaction-generator
docker-compose build transaction-generator
docker-compose up transaction-generator
docker restart mongodb
