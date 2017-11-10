var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');


var app = express();

//To accept JSON and encoded values in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));





//Load models from the ./models folder
app.models = require('./models');

//Load routes
require('./routes')(app);


mongoose.connect("mongodb://localhost/lime");
mongoose.connection.once('open', function () {

    console.log("[INFO] Connected to MongoDB via Mongoose ");

    //Start listening after connection to MongoDB
    app.listen(3000, function () {
        console.log("[INFO] Express server running on port 3000");
    });
});

