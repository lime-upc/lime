#!/bin/sh
# Ismael
if [ ! -z "$ADVERTISED_HOST" ]; then
    echo "advertised host: $ADVERTISED_HOST"
    # Uncomment advertised.listeners
    sed -r -i 's/^(#)(advertised.listeners)/\2/g' /opt/kafka/config/server.properties

    # Replace your.host.name with $ADVERTISED_HOST
    sed -r -i "s/your.host.name/$ADVERTISED_HOST/g" /opt/kafka/config/server.properties
fi
if [ ! -z "$ADVERTISED_PORT" ]; then
    echo "advertised port: $ADVERTISED_PORT"
    sed -r -i "s/#(advertised.port)=(.*)/\1=$ADVERTISED_PORT/g" /opt/kafka/config/server.properties
fi
if [ ! -z "$NUM_PARTITIONS" ]; then
    echo "default number of partition: $NUM_PARTITIONS"
    sed -r -i "s/(num.partitions)=(.*)/\1=$NUM_PARTITIONS/g" /opt/kafka/config/server.properties
fi

# Enable/disable auto creation of topics
if [ ! -z "$AUTO_CREATE_TOPICS" ]; then
    echo "auto.create.topics.enable: $AUTO_CREATE_TOPICS"
    echo "\nauto.create.topics.enable=$AUTO_CREATE_TOPICS" >> $KAFKA_HOME/config/server.properties
fi

/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
