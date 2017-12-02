##Transactions Generator
Lime Transactions generator is a standalone app that can be easily run with Docker Compose utility.
 
To run the transaction generator, use a following script:
`docker-compose build transaction-generator; docker-compose up transaction-generator`

To change parameters of generator, you need to change `docker-compose.yml` file.
There are three system properties that can be used for configuration:
* `size [int]` is a number of generated transactions, 2000 by default
* `date [date]` is a transactions date (date format is `yyyy-MM-dd`), current date by default
* `dropExisting [boolean]` is a flag showing that collection should be cleared before generation or not, true by default

The application generates data and writes in to MongoDB instance running at host `mongodb` and port `27017`. 
When using docker-compose, it first creates MongoDB container named `mongodb` and then links it into application 
container named `transaction-generator` by hostname `mongodb`, so no additional actions needed to run these two 
containers. When running through docker-compose, Docker first checks whether `mongodb` container exists or not, 
and is running or not. 

If you want to change generation algorithm, you need make changes `TransactionGenerator` class. After that you should 
repackage the application using command `mvn clean install`. Then rebuild image using `docker-compose 
build transaction-generator`. Then just run it with `docker-compose up transaction-generator`. The data in MongoDB 
container will be saved. 