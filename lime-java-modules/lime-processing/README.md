# Lime Processing System

This module contains whole backend of processing system. To launch it, run (with `sudo` if needed):

`docker-compose up -d processing`

This command creates and runs two Docker containers:
1. postgresql - a container with PostgreSQL instance on port 5432
2. processing - a container with embedded Spring Boot application on port 8080

The processing system provides HTTP API to implement processing according to processing system flowchart. Each POST method consumes JSON object in request body and can return some JSON in response body. 
Each API method call has to provide the following headers:
* `Accept: application/json`
* `Content-Type: application/json`

This HTTP API is supposed to be used on both business owner webapp and mobile app. It provides the following methods:

### `GET /info/{transactionId}`
`/info` is a controller which returns information about any transaction in system anytime. It consumes transaction id 
as GET parameter and ignores any request body, and returns JSON object with the following fields:
* `transactionId : String` (transaction id)
* `userId : int` (user id)
* `businessId : int` (business id)
* `paymentAmount : double` (payment amount)
* `paybackAmount : double` (payback)
* `status : String` (transaction status)
* `type : String` (transaction type)
* `startedAt : Timestamp` (timestamp when transaction was created)
* `finishedAt : Timestamp` (timestamp when transaction was completed or failed)

### `POST /start` 
`/start` is a controller which creates new transaction in processing system.
It consumes JSON object in body with two fields: 
* `boid : int` (business identifier) 
* `amount : double` (payment amount)
and returns transaction id as String.

### `PATCH /confirm/user`
`/confirm/user` is a controller which confirms a transaction with virtual money. It consumes JSON object with following fields:
* `id : String` (transaction id)
* `user : int` (user id)
* `confirmed : boolean` (flag which identifies that user whether confirms transaction or not)
and returns JSON object representing full transaction state

### `PATCH /payback`
`/payback` is a controller which states that the user wants to pay with real money and receive payback. It consumes JSON object with the following fields:
* `id : String` (transaction id)
* `user : int` (user id)
and returns JSON object representing full transaction state

### `PATCH /confirm/business`
`/confirm/business` is a controller which confirms that user payed with real money and it's possible to get him virtual payback. It consumes JSON object with the following fields:
* `id : String` (transaction id)
* `confirmed : boolean` (flag which identifies that business owner whether confirms transaction or not)
and returns JSON object representing full transaction state

### `GET /balance`
`/balance` is a controller which returns current user balance. It consumes `user` GET parameter and produces `Double`.

### `GET /transactions`
`/transactions` is a controller which returns transactions by any given filter. In consumes GET parameters:
* `boid : int` (business id, optional)
* `user : int` (user id, optional)
* `from : Timestamp` (start timestamp, optional)
* `to : Timestamp` (end timestamp, optional)

## Notes
Each controller returns response wrapped in JSON object with the following structure:
* `error : boolean` (identifies whether request is handled with error or not)
* `message : Object` (may contain any Object, it depends on underlying handler).

Timestamp format for each method is `yyyy-MM-dd HH:mm:ss`. 