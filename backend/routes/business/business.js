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
     * GET /businessData -  Get all info of a business owner (except password)
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    router.get("/businessData",passport.authenticate('jwt', { session: false }));
    router.get("/businessData", function (req, res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }

        Business.findOne({email: req.params.email}, 'email name_person_in_charge address phone_number')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The business owner does not exist"});
                    return;
                }

                res.send({
                    "error": false,
                    "message": result.withoutPassword()
                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving business owner data"});
            });
    });

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


    /**
     * POST /login - Authenticates the business owner
     *
     * Authentication: NO
     * Permissions: anybody
     */
    router.post("/login",function(req,res){
        
                //ERROR: No user or no password
                if (!req.body.email || !req.body.password){
                    res.status(400).send({
                        "error": true,
                        "message": "Please, specify both email and password"
                    });
        
                    return;
                }
        
                //Retrieve email from database
                Business.findOne({email:req.body.email})
                    .then(function(result){
        
                        //ERROR: No result, so the username does not exist
                        if(!result){
                            res.status(401).send({"error": true, "message": "Incorrect email or password"});
                            return;
                        }
        
                        var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
        
                        //ERROR: Password is incorrect
                        if (hash !== result.password){
                            res.status(401).send({"error": true, "message": "Incorrect email or password"});
                            return;
                        }
        
                        //No error. Generate JWT with email
                        var token = jwt.sign({ email: req.body.email }, config.jwtsecret);
        
                        res.send({
                            "error": false,
                            "message": token
                        });
                    })
                    .catch(function(error){
                        res.status(500).send({"error": true, "message": "Error removing business " + error});
                    });
        
        
            });

    return router;
};