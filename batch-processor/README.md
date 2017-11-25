# Ingestion - Datalake Dispatcher

Module that implements the Batch Processor.
Note: Only works with Kafka and HDFS from the Lime Virtual Machine.

## How to run it locally

1. Start Kafka in Virtual Machine
2. Start HDFS in Virtual Machine
3. Start the Ingestion-Datalake glue module
4. RIN YOUR LOCAL MACHINE, go to this folder.
5. Run `mvn install` to download dependencies.
5. Run `mvn exec:java -Dexec.mainClass="org.lime.batch.Main"` to start the glue.

