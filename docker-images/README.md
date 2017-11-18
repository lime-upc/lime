# Docker files

This folder contains Docker files to run Kafka, HDFS, etc in your computer, very easily and without having to launch virtual machines.

Please, * Install Docker before running it *

#KAFKA

1. `sudo docker build -t lime-kafka .`
2. `sudo docker run -p 2181:2181 -p 9092:9092 -e ADVERTISED_HOST=127.0.0.1 -e NUM_PARTITIONS=1 -e AUTO_CREATE_TOPICS=1 lime-kafka`



