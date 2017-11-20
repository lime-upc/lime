#KAFKA and ZOOKEEPER DOCKER IMAGE
#Author: Ismael Rodriguez, 18/11/17
#Based on https://github.com/hey-johnnypark/docker-kafka-zookeeper

FROM java:openjdk-8-jre

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && \
    apt-get install -y wget supervisor && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

#Download Kafka+Zookeeper, put it in /opt/
RUN wget -q http://apache.rediris.es/kafka/1.0.0/kafka_2.11-1.0.0.tgz -O /tmp/kafka.tgz
RUN tar -xvf /tmp/kafka.tgz -C /opt && rm /tmp/kafka.tgz
RUN mv /opt/kafka_2.11-1.0.0 /opt/kafka

ADD scripts/start-kafka.sh /usr/bin/start-kafka.sh
ADD scripts/start-zookeeper.sh /usr/bin/start-zookeeper.sh

#Supervisor config
ADD supervisor/kafka.conf supervisor/zookeeper.conf /etc/supervisor/conf.d/

#2181 is zookeeper, 9092 is kafka
EXPOSE 2181 9092

CMD ["supervisord","-n"]
