#!/bin/bash
FILENAME=./transaction-generator.jar
PROPS=$@
echo "Starting $FILENAME with options $JAVA_OPTS $PROPS"
exec /usr/bin/java -jar $JAVA_OPTS $PROPS $FILENAME