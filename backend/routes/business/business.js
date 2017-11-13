/**
 * Router module that handles the BISUNESS REST API and BUSINESS OWNER LOGIN
 */
var express = require('express');
var crypto = require('crypto');
var config = require('../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');


module.exports = function (app) {

    var router = express.Router();

    var Business = app.models.Business; //Get Business Model

    /**
     * POST /register = Creates new business owner
     *
     * Authentication: No
     * Permissions: Everybody
     */

    router.post("/register", function(req,res){

        //Check that all the fields in request are completed
        if (!req.body.email || !req.body.password) {
                res.status(400).send({
                    "error": true,
                    "message": "All the parameters are required"
                });
                return;
        }

        //Create password hash
        var passHash = crypto.createHash('md5').update(req.body.password).digest('hex');

        //Create Mongoose object (business owner)
        var newBO = new Business(
            {
                email: req.body.email,
                password: passHash,
                name_person_in_charge: "",
                address: "",
                phone_number: "",
            }
        );

        newBO.save()
            .then(function(response){
                res.send({
                    "error": false,
                    "message": response.withoutPassword()
                });
            })
            .catch(function(error){
                //Error because mail already registered (unique key conflict in Mongoose is error 11000).
                if ( error.code === 11000 ) {
                    res.status(400).send({"error": true, "message": "That mail is already registered"});
                    return;
                }
                res.status(500).send({"error": true, "message": "Error creating business owner " + error});
            });

    });

    return router;
};