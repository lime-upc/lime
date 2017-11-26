/**
 * Transaction model.
 */
var mongoose = require('mongoose');

//Define schema
var TransactionSchema = mongoose.Schema({
    user: {type: String, required:false},
    business_owner: {type: String, required: true},
    timestamp: {type: Number, required: true},
    virtual_money_used: {type: Number, required: false},
    payback_amount: {type: Number, required: false},
    total_amount: {type: Number, required: false},
    status: {type: String, required: true}
});



//Compile model
Transaction = mongoose.model('Transaction', TransactionSchema);

//Export the model
module.exports = Transaction;