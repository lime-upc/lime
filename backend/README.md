# LIME Backend

This folder contains the REST server and other useful scripts.
Please, make sure that you run `npm install` every time you pull, and before running anything.


## REST Server

This server offers the REST API of Lime.

How to run it: 
* Make sure MongoDB is running 
* If, in config, kafka_enabled is true, then make sure Kafka is running.
* Make sure you have run the deploy script `npm run deploy`
* Run `npm start`

How to configure it:
* Configure connection options in config.js

## Deploy Script
This scripts cleans the database and creates data to start operating.
Performs the following operations:
* Cleans all the databases
* Creates 2000 fake users, with mail 'test-X@lime.com' where X goes from 0 to 1999. Password is always 123.
* Creates a 'admin@lime.com' user, with password '123'.
* Loads the restaurants from Google Places into Database.
* Creates as many fake business owners as Google Places entries, with mail 'bo-X@lime.com' and password '123'. Each one has a different restaurant associated.


How to run it:
1. Make sure that Backend is running
2. Run `npm run deploy`

How to configure it:
* Configure connection options in config.js

## KafkaMessageLogger
This script just consumes data from local Kafka instance and 'lime-location' topic and displays it on the console.
Use it for testing.

How to run it:
1. Make sure Kafka is running
2. Run `npm run kafka-logger`

How to configure it:
* Configure connection options in config.js



## Location Simulator

This script simulates that a certain number of users are sending data in real time, following some configured routes.
The users behave like real people, as they walk with a walking pace, the pace changes, and they stop to have breakfast, lunch, dinner, coffee and sleep.
By default, it only simulates 500 simultaneous users sending data every 10 seconds.

How to run it:
1. Make sure that Backend and Kafka are running
2. Make sure that you created fake users with Fake Users Creator
3. Run `npm run simulator`

How to configure it:
* Configure connection options in config.js
* Configure update frequency, walk speed, stops and other parameters in main.js

How to add paths:
1. Go to https://www.gpsies.com, register and create a walking route.
2. Save it, and export it as GeoJSON Track 
3. Copy the file into location-simulator/paths folder.
4. That's all!

## Google Places API Data Loader

This scripts loads restaurant data from Google Places API, and inserts it into a "restaurants" spatial collection of MongoDB.
Also, creates spatial indexes to make queries on spatial data much faster.

How to run it: 
* Make sure MongoDB is running 
* Run `npm run load-restaurants` if you want to load places for first time.
* Run `npm run update-restaurants` if you want to update existing places.