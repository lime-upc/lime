/**
 * Wallet model.
 */
var mongoose = require('mongoose');

//Define schema
var WalletSchema = mongoose.Schema({
    email: {type: String, required:true, unique: true},
    balance_amount: {type: Number, required: true},
    total_money_received:  {type: Number, required: true},
    total_money_spent: {type: Number, required: true}
});

WalletSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};


//Compile model
Wallet = mongoose.model('Wallet', WalletSchema);

//Export the model
module.exports = Wallet;