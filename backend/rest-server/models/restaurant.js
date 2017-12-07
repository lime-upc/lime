/**
 * Restaurant model.
 */
var mongoose = require('mongoose');

//Define schema
var RestaurantSchema = mongoose.Schema({
    _id: {type: String, required:true, unique: true},
    name: {type: String, required: true},
    location: {
    	type: {type: String, required: true},
    	coordinates: {type: Array, required: true}
    },
    price_level: {type: Number, required: false},
    rating: {type: Number, required: false},
    address: {type: String, required: true},
    permanently_closed: {type: Boolean, required: true}
});

//Compile model
Restaurant = mongoose.model('Restaurant', RestaurantSchema); //SpatialDB is the name of the already-existing collection of restaurants

//Export the model
module.exports = Restaurant;