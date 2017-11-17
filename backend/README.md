# LIME Backend

This folder contains the REST server and other useful scripts.
Please, make sure that you run `npm install` every time you pull, and before running anything.


## REST Server

This server offers the REST API of Lime.

How to run it: 
* Make sure MongoDB is running 
* If, in config, kafka_enabled is true, then make sure Kafka is running.
* Run `npm start`

How to configure it:
* Configure connection options in config.js

## KafkaMessageLogger
This script just consumes data from local Kafka instance and 'lime-location' topic and displays it on the console.
Use it for testing.

How to run it:
1. Make sure Kafka is running
2. Run node `KafkaMessageLogger.js`

How to configure it:
* Configure connection options in config.js

## Fake Users Creator
This script creates 2000 (configurable) fake users, with fake gender, fake birth date and fake preferences.
Email format is 'test-X@lime.com' where X is number from 0 to 1999. Password is always 123.

How to run it:
1. Make sure that Backend and Kafka are running
2. Run `node fakeUserCreator.js`

How to configure it:
* Configure connection options in config.js
* You can change number of created users in fakeUserCreator.js

## Location Simulator

This script simulates that a certain number of users are sending data in real time, following some configured routes.
The users behave like real people, as they walk with a walking pace, the pace changes, and they stop to have breakfast, lunch, dinner, coffee and sleep.
By default, it only simulates 500 simultaneous users sending data every 10 seconds.

How to run it:
1. Make sure that Backend and Kafka are running
2. Make sure that you created fake users with Fake Users Creator
3. Run `node locationSimulator.js`

How to configure it:
* Configure connection options in config.js
* Configure update frequency, walk speed, stops and other parameters in locationSimulator.js

How to add paths:
1. Go to https://www.gpsies.com, register and create a walking route.
2. Save it, and export it as GeoJSON Track 
3. Copy the file into location-simulator/paths folder.
4. That's all!

