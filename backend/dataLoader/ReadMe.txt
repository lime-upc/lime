API Key for Google Places API:
AIzaSyDSQ9WzBTaM49moFFEbw41jERSh-LYsyf0


1) Install/Update node and npm:
nvm install 8.9
nvm use 8.9 
nvm alias default 8.9
npm cache clean --force
sudo npm install -g npm 
sudo npm install npm@latest -g

2) Install Google Maps Services Node.js client, MongoDB Driver
cd ~/NPM-NodeJs
npm init --yes
npm install @google/maps
npm install mongodb

//http://www.opentechguides.com/how-to/article/nodejs/125/express-mongodb-json.html

>>>3) Run the js script:
cd ~/NPM-NodeJs
node script.js


4) Install mongoDB on Mac (https://treehouse.github.io/installation-guides/mac/mongo-mac.html)
brew update
brew install mongodb
sudo mkdir -p /data/db
sudo chown -R `id -un` /data/db
mongod --dbpath=/data


5) Useful MONGODB commands:

To enter Mongo shell:
mongo
show dbs
use SpatialDB
show collections
db.businesses.find() //retrieve all
db.businesses.count() //count number of docs in the collection


TO completely REMOVE A COLLECTION: db.businesses.drop()

TO completely REMOVE A DATABASE: 
use databaseToBeDropped
db.dropDatabase()

First steps:
http://mongodb.github.io/node-mongodb-native/2.2/quick-start/quick-start/
https://www.w3schools.com/nodejs/nodejs_mongodb_insert.asp
