API Key for Google Places API:
AIzaSyDSQ9WzBTaM49moFFEbw41jERSh-LYsyf0


1) Install/Update node and npm:
nvm install 8.9
nvm use 8.9 
nvm alias default 8.9
npm cache clean --force
sudo npm install -g npm 
sudo npm install npm@latest -g

2) Install Google Maps Services Node.js client, MongoDB Driver, Async
cd ~/NPM
npm init --yes
npm install @google/maps
npm install mongodb
npm install async

3) Install mongoDB on Mac (https://treehouse.github.io/installation-guides/mac/mongo-mac.html)
brew update
brew install mongodb
sudo mkdir -p /data/db
sudo chown -R `id -un` /data/db
//http://www.opentechguides.com/how-to/article/nodejs/125/express-mongodb-json.html

4) Run the Data Downloader JS script:
node dataDownloader.js

5) Launch the MongoDB server and run DB loader JS script:
mongod
node DBloader.js



>>>> Useful MONGODB commands:

To enter Mongo shell:
mongo
show dbs
use lime
show collections
db.spatialDB.find() //retrieve all
db.spatialDB.count() //count number of docs in the collection


TO completely REMOVE A COLLECTION: 
db.spatialDB.drop()

TO completely REMOVE A DATABASE: 
use databaseToBeDropped
db.dropDatabase()


To dump a collection from a MongoDB database
(outside of the MongoDB shell)
mongodump --collection spatialDB --db lime
https://docs.mongodb.com/manual/tutorial/backup-and-restore-tools/



First steps:
http://mongodb.github.io/node-mongodb-native/2.2/quick-start/quick-start/
https://www.w3schools.com/nodejs/nodejs_mongodb_insert.asp
