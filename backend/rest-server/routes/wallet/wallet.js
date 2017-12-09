/**
 * Router module that handles the WALLET rest API
 */
var express = require('express');
var passport = require('passport');
var generateLinks = require('../linkGenerator');


module.exports = function (app) {

    var router = express.Router();

    var Wallet = app.models.Wallet;


    //Get all the wallets
    router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/",function(req,res){

        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/wallets"})});
            return;
        }


        Wallet.find({})
            .then(function(response){


                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({
                        list: "/wallets"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving wallets " + error,"_links": generateLinks({list: "/wallets"})});
            });


    });

    //Get one specific wallet
    router.get("/:email",passport.authenticate('jwt', { session: false }));
    router.get("/:email",function(req,res){

        if(req.user.email!==req.params.email && req.user.email!=="admin@lime.com"){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/wallets"})});
            return;
        }
        Wallet.findOne({email:req.params.email})
            .then(function(response){


                if(!response){
                    res.status(404).send({
                        "error": true,
                        "message": "Wallet not found"
                    });
                    return;
                }
                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({
                        self: "/wallets/" + req.user.email,
                        user: "/users/" + req.user.email,
                        list: "/wallets"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving wallet " + error,"_links": generateLinks({list: "/wallets"})});
            });



    });




    return router;
};