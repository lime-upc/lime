/**
 * Router module that handles the TRANSACTIONS rest API
 */
var express = require('express');
var passport = require('passport');
var generateLinks = require('../linkGenerator');


module.exports = function (app) {

    var router = express.Router();

    var Transaction = app.models.Transaction; //Get Transaction model
    var Wallet = app.models.Wallet;
    var BusinessOwner = app.models.Business;


    /**
     * GET / - Gets all transaction.
     * Possible filters in query: user, bo, status, startDate, endDate. Combine them as you want.
     *
     * Authentication: YES
     * Permissions:
     *  - Users can get only transactions in which they are implied. Can search only if user is set to their email.
     *  - BO can get only transactions in which they are implied. Can search only if bo is set to their email.
     *  - Admin can get everything.
     */
    router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/",function(req,res){






        var userFilter = req.query.user;
        var boFilter = req.query.bo;
        var statusFilter = req.query.status;
        var startFilter = req.query.startDate;
        var endFilter = req.query.endDate;


        var searchObject = {};
        if(userFilter){ searchObject.user = userFilter}
        if(boFilter){searchObject.business_owner = boFilter}
        if(statusFilter) { searchObject.status = statusFilter}
        if(startFilter && endFilter){
            var from = startFilter.split("-");
            var fromDate = new Date(from[2], from[1] - 1, from[0]);
            var fromTimestamp = fromDate.getTime();


            var end = endFilter.split("-");
            var endDate = new Date(end[2], end[1] - 1, Number(end[0]) + 1);
            var endTimestamp = endDate.getTime();

            searchObject.timestamp = {$gte: fromTimestamp, $lt: endTimestamp };


        }
        else if(startFilter) {
            var from = startFilter.split("-");
            var fromDate = new Date(from[2], from[1] - 1, from[0]);
            var fromTimestamp = fromDate.getTime();

            searchObject.timestamp = {$gte: fromTimestamp};
        }

        else if(endFilter) {
            var end = endFilter.split("-");
            var endDate = new Date(end[2], end[1] - 1, Number(end[0]) + 1 );
            var endTimestamp = endDate.getTime();


            searchObject.timestamp = {$lte: endTimestamp};

        }



        //Only admin can do all operations
        if(req.user.email!=='admin@lime.com'){

            //No filters
            if(!userFilter && !boFilter){
                res.status(403).send({error: true, message: "You are not authorized to perform this action"});
                return;
            }

            //If both user and bo specified, requester has to be one of both
            if(userFilter && boFilter){
                if(userFilter!==req.user.email && boFilter!==req.user.email){
                    res.status(403).send({error: true, message: "You are not authorized to perform this action"});
                    return;
                }
            }
            else if(userFilter){ //Only user filter, then has to be user
                if(userFilter!==req.user.email){
                    res.status(403).send({error: true, message: "You are not authorized to perform this action"});
                    return;
                }
            }
            else if(boFilter){  //Only bo filter, then has to be bo
                if(boFilter!==req.user.email){
                    res.status(403).send({error: true, message: "You are not authorized to perform this action"});
                    return;
                }
            }
        }



        Transaction.find(searchObject)
            .then(function(response){

                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({
                        self: "/transactions"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving transactions " + error});
            });
    });


    /**
     * POST / - Creates a new transaction.
     *
     * Authentication: YES
     * Permissions: Admin, Business Owner.
     */
    router.post("/",passport.authenticate('jwt', { session: false }));
    router.post("/",function(req,res){

        //TODO: Check if it is not a business owner

        if(!req.body.total_amount){
            res.status(400).send({
                "error": true,
                "message": "Total amount is required"
            });
            return;
        }

        var newTransaction = new Transaction({
            business_owner: req.user.email,
            total_amount: req.body.total_amount,
            timestamp: Date.now(),
            status: "new"
        });

        newTransaction.save()
            .then(function(response){

                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({
                        self: "/transactions/" + response._id,
                        list: "/transactions"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error creating transaction " + error});
            });



    });

    router.get("/:transactionID",passport.authenticate('jwt', { session: false }));
    router.get("/:transactionID",function(req,res){



        Transaction.findOne({_id: req.params.transactionID})
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The transaction does not exist"});
                    return;
                }


                if(result.status!=="new"){ //When no new, only bo, admin and user can read it
                    if(req.user.email!==result.business_owner &&
                       req.user.email!==result.user &&
                       req.user.email!=="admin@lime.com"){
                        res.status(403).send({"error": true, "message": "Permission forbidden"});
                        return;
                    }

                }

                res.send({
                    "error": false,
                    "message": result,
                    "_links": generateLinks({
                        self: "/transactions/" + result._id,
                        list: "/transactions"
                    })
                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving transaction data"});
            });

    });


    /**
     * POST /:id/link_user.
     * Associates a transaction with a user, and specifies how many virtual money the user wants to use.
     * Returns error if vm is more than 50%, if user has not that money, of if transaction is not in "new" state.
     *
     * Authentication: YES
     * Permissions: User
     */
    router.post("/:transactionID/link_user",passport.authenticate('jwt', { session: false }));
    router.post("/:transactionID/link_user", function(req,res){

        //Parameters missing
        if(req.body.virtual_money_used===undefined){
            res.status(400).send({
                "error": true,
                "message": "virtual_money_used is required"
            });
            return;
        }


        return Wallet.findOne({email: req.user.email})
            .then(function(wallet){


                //Check virtual money balance. The user can pay with 0 VM.
                var remainingMoney=  wallet.balance_amount - req.body.virtual_money_used;
                if(remainingMoney < 0){

                    res.status(400).send({"error": true, "message": "You don't have that amount of virtual money"});
                    return;
                }

                return Transaction.findOne({_id: req.params.transactionID})
                    .then(function(tx){

                        //Transaction not found
                        if(!tx){
                            res.status(404).send({"error": true, "message": "The transaction does not exist"});
                            return;
                        }


                        //If more than 50% paid with vm, error
                        if(2*req.body.virtual_money_used > tx.total_amount){
                            res.status(400).send({error: true, message:"You cannot pay more than 50% of total with Virtual Money"});
                        }

                        //Only can do this when new.
                        if(tx.status!=="new"){
                            res.status(400).send({"error": true, "message": "Transaction status is already " + tx.status});
                            return;
                        }


                        //Update it, set to 'user_accepted' and calculate payback (Currently, it is 3% of real money paid).
                        //The payback is not added yet to the user wallet.
                        tx.virtual_money_used = req.body.virtual_money_used;
                        tx.payback_amount = (tx.total_amount - tx.virtual_money_used)*0.03;
                        tx.status = "user_accepted";
                        tx.user = req.user.email; //Dont forget to set the mail
                        return tx.save().then(function(response){
                            res.send({
                                "error": false,
                                "message": response,
                                "_links": generateLinks({
                                    self: "/transactions/" + response._id,
                                    list: "/transactions"
                                })
                            });
                        })



                    })



            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error updating transaction " + error});
            });





    });

    /**
     * POST /:id/confirm.
     * Used by the Business Owners to confirm a transaction. When confirmed, the user wallet is modified accordingly.
     * Can only be done in user_accepted state. Not when user has not selected virtual money amount, or when the transaction
     * is already confirmed or rejected.
     *
     * Authentication: YES
     * Permissions: Business Owner that created the transaction or Admin.
     */
    router.post("/:transactionID/confirm",passport.authenticate('jwt', { session: false }));
    router.post("/:transactionID/confirm", function(req,res){



        Transaction.findOne({_id: req.params.transactionID})
            .then(function(tx){

                //Not found
                if(!tx){
                    res.status(404).send({"error": true, "message": "The transaction does not exist"});
                    return;
                }

                //Check BO
                if(tx.business_owner !== req.user.email && req.user.email !== "admin@lime.com"){
                    res.status(403).send({"error": true, "message": "You don't have the permission to confirm this transaction"});
                    return;
                }

                //Check that user paid
                if(tx.status==="new"){

                    res.status(400).send({"error": true, "message": "User has yet to introduce virtual money amount"});
                    return;
                }

                //Check it is not already confirmed
                if(tx.status==="confirmed"){

                    res.status(400).send({"error": true, "message": "Transaction is already confirmed"});
                    return;
                }

                //Check it is not already rejected
                if(tx.status==="rejected"){

                    res.status(400).send({"error": true, "message": "Transaction is rejected. Cannot confirm."});
                    return;
                }

                //If passes all the checks, then confirm

                //Update it, set to 'confirmed'
                tx.status = "confirmed";
                return tx.save().then(function(response){

                    //Now, we put the payback and retrieve virtual money
                    //Payback is 3% of paid with real money
                    var payback = tx.payback_amount;
                    var vm_spent = tx.virtual_money_used;
                    var updateObject =
                        {$inc:
                                {   balance_amount: -vm_spent + payback,
                                    total_money_spent: vm_spent,
                                    total_money_received: payback}

                        };
                    return Wallet.findAndModify({email: tx.user},[],updateObject)
                        .then(function(r){
                            res.send({
                                "error": false,
                                "message": response,
                                "_links": generateLinks({
                                    self: "/transactions/" + response._id,
                                    list: "/transactions"
                                })
                            });
                        });

                })



            })

            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error confirming transaction " + error});
            });

    });


    /**
     * POST /:id/reject.
     * Used by the Business Owners to reject a transaction that has not been confirmed or rejected.
     * The user wallet is not modified.
     *
     * Authentication: YES
     * Permissions: Business Owner that created the transaction or Admin.
     */
    router.post("/:transactionID/reject",passport.authenticate('jwt', { session: false }));
    router.post("/:transactionID/reject", function(req,res){




        Transaction.findOne({_id: req.params.transactionID})
            .then(function(tx){

                //Not found
                if(!tx){
                    res.status(404).send({"error": true, "message": "The transaction does not exist"});
                    return;
                }

                //Check BO
                if(tx.business_owner !== req.user.email && req.user.email !== "admin@lime.com"){
                    res.status(403).send({"error": true, "message": "You don't have the permission to reject this transaction"});
                    return;
                }


                //Check it is not already confirmed
                if(tx.status==="confirmed"){

                    res.status(400).send({"error": true, "message": "Transaction is already confirmed"});
                    return;
                }

                //Check it is not already rejected
                if(tx.status==="rejected"){

                    res.status(400).send({"error": true, "message": "Transaction is already rejected"});
                    return;
                }

                //If passes all the checks, then confirm

                //Update it, set to 'confirmed'
                tx.status = "rejected";
                return tx.save().then(function(response){

                    res.send({
                        "error": false,
                        "message": response,
                        "_links": generateLinks({
                            self: "/transactions/" + response._id,
                            list: "/transactions"
                        })
                    });

                })



            })

            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error rejecting transaction " + error});
            });

    });



    return router;
};