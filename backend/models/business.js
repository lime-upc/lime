/**
 * Business Owner model.
 */
var mongoose = require('mongoose');

//Define schema
var BusinessSchema = mongoose.Schema({
    email: {type: String, required:true, unique: true},
    password: {type: String, required: true},
    name_person_in_charge: {type: String},
    address: {type: String},
    phone_number: {type: String}
});

//Devuelve un objeto apto para devolver por interfaz rest,
//quitando las propiedades _id y __v del usuario, y añadiendo href
BusinessSchema.methods.withoutPassword = function(){
    var object = this.toJSON();
    delete object.password;
    return object;
};

//Compile model
Business = mongoose.model('Business', BusinessSchema);

//Export the model
module.exports = Business;