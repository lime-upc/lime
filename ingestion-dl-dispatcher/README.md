# Ingestion - Datalake Dispatcher

Module that moves data from Kafka to HDFS, using Spark Streaming.
Note: Only works with Kafka and HDFS from the Lime Virtual Machine.

## How to run it locally

1. Start Kafka in Virtual Machine
2. Start HDFS in Virtual Machine
3. Wait about 1 min so HDFS is ready
4. RIN YOUR LOCAL MACHINE, go to this folder.
5. Run `mvn install` to download dependencies.
5. Run `mvn exec:java -Dexec.mainClass="org.lime.lakeglue.Main"` to start the glue.
5. Start producing data, for example using the location simulator (In your local machine also)


