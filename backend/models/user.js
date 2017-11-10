/**
 * End-user model.
 */
var mongoose = require('mongoose');

//Define schema
var UserSchema = mongoose.Schema({
    email: {type: String, required:true, unique: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    password: {type: String, required: true},
    date_of_birth: {type: Date, required: true},
    gender: {type: String, required: true},
    preferences:  [{type: String}]
});


//Devuelve un objeto apto para devolver por interfaz rest,
//quitando las propiedades _id y __v del usuario, y añadiendo href
UserSchema.methods.withoutPassword = function(){
    var object = this.toJSON();
    delete object.password;
    return object;
};

//Compile model
User = mongoose.model('User', UserSchema);




//Export the model
module.exports = User;