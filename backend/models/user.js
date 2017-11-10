/**
 * End-user model.
 */
var mongoose = require('mongoose');

//Define schema
var UserSchema = mongoose.Schema({
    email: {type: String, required:true, unique: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    date_of_birth: {type: Date, required: true},
    gender: {type: String, required: true},
    preferences:  [{type: String}]
});

//Compile model
User = mongoose.model('User', UserSchema);

//Export the model
module.exports = User;