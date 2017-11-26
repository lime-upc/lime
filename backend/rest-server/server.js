var express = require('express'),
    mongoose = require('mongoose'),
    config = require("../config"),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    cors = require('cors');


var app = express();
app.use(passport.initialize()); //Init passport

//To accept JSON and encoded values in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//Enable CORS requests on all routes
app.use(cors());
//Load models from the ./models folder
app.models = require('./models');

//Load routes
require('./routes')(app);

//Set-up passport with JWT strategy
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt'); //JWT comes from Auth Header Bearer strategy
opts.secretOrKey = config.jwtsecret;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {


    var isBusiness = jwt_payload.business;

    if(isBusiness){
        app.models.Business.findOne({email: jwt_payload.email}, function(err, user) {
                if (err) {
                    return done(err, false);
                }
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false); //When mail does not exist
                }
            });
    }
    else{
        app.models.User.findOne({email: jwt_payload.email}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false); //When mail does not exist
            }
        });
    }

}));




var MONGO = ( process.env.MONGODB_URI || config.db );
if(app.settings.env === 'test') {
    MONGO = config.db_test;
}

//If Heroku, use local MongoDB URI
mongoose.connect(MONGO);
mongoose.connection.once('open', function () {

    console.log("[INFO] Connected to MongoDB via Mongoose ");

    //Start listening after connection to MongoDB
    //If Heroku, use that port
    app.listen( process.env.PORT || config.port, function () {
        console.log("[INFO] Express server running on port "  + (process.env.PORT || config.port));
    });
});


module.exports = app;