[![Build Status](https://travis-ci.org/lime-upc/lime.svg?branch=master)](https://travis-ci.org/lime-upc/lime)

# lime!

* App: Source code for the mobile application
* Backend: Source code for REST-API server, location simulator and fake user generator.
* Ingestion-DL-Dispatcher: Spark Streaming module that moves data from Kafka to HDFS (Ingestion to the Dta Lake)
* Web: Source code for the business dashboard web.
* Spark-streaming-kafka-consumer-sample: Sample of Spark Streaming code that reads from Kafka.
* Batch-processor: Implements the Batch Processor for analytics, with Spark.

Also, there is a virtual machine that includes Kafka and HDFS instances. Except that, everything is run on local host.
