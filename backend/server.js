var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport');


var app = express();

//To accept JSON and encoded values in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));




//Load models from the ./models folder
app.models = require('./models');

//Load routes
require('./routes')(app);

app.use(passport.initialize());


var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt'); //JWT comes from Auth Header Bearer strategy
opts.secretOrKey = 'SECRET';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {

    app.models.User.findOne({email: jwt_payload.email}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));



mongoose.connect("mongodb://localhost/lime");
mongoose.connection.once('open', function () {

    console.log("[INFO] Connected to MongoDB via Mongoose ");

    //Start listening after connection to MongoDB
    app.listen(3000, function () {
        console.log("[INFO] Express server running on port 3000");
    });
});

