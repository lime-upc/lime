/**
 * Router module that handles the BUSINESS OWNER REST API
 */
var express = require('express');
var crypto = require('crypto');
var config = require('../../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');


module.exports = function (app) {

    var router = express.Router();

    var Business = app.models.Business; //Get Business Model
    var Restaurant = app.models.Restaurant; //Get Restaurant Model


    /**
     * GET / - Gets all business owners, without password
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {


        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }


        Business.find({}, 'email phone_number person_in_charge_name business automatic_notifications')
            .then(function(response){


                res.send({
                    "error": false,
                    "message": response
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving business owner data " + error});
            });



    });

    /**
     * GET /:email -  Get all info of a business owner (except password)
     *
     * Authentication: Yes
     * Permissions: The own BO, Admin
     */
    router.get("/:email",passport.authenticate('jwt', { session: false }));
    router.get("/:email", function (req, res) {

        if ((req.user.email !== req.params.email) && (req.user.email !== 'admin@lime.com')){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }

        Business.findOne({email: req.params.email}, 'email  phone_number person_in_charge_name business automatic_notifications')
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
     * POST / = Creates new business owner
     * Also, it has a restaurant_id parameter, that is the ID of the restaurant you want to associate with.
     * If it does not exist, returns 400 error.
     * If the restaurant is already assigned to another business owner, returns 400 error.
     * Else, creates the business profile info, and inside it, inserts the information about the restaurant.
     *
     * Authentication: No
     * Permissions: Everybody
     */

    router.post("/", function(req,res){

        //Check that all the fields in request are completed
        if (!req.body.email || !req.body.password || !req.body.person_in_charge_name || !req.body.restaurant_id) {
                res.status(400).send({
                    "error": true,
                    "message": "Required parameters are missing"
                });
                return;
        }

        //First, check that the restaurant_id exists in the spatial DB
        Restaurant.findOne({_id: req.body.restaurant_id})
            .then(function(restaurantObject){
                if(restaurantObject) {

                    //Now, we have to check if the restaurant is already taken by a business owner
                    Business.findOne({"business._id": req.body.restaurant_id})
                        .then(function(existingBusiness){
                            if(!existingBusiness){

                                //Create password hash
                                var passHash = crypto.createHash('md5').update(req.body.password).digest('hex');

                                var tags = [];
                                if(req.body.tags){
                                    tags = req.body.tags;
                                }
                                //Create Mongoose object (business owner)
                                var newBO = new Business(
                                    {
                                        email: req.body.email,
                                        password: passHash,
                                        person_in_charge_name: req.body.person_in_charge_name,
                                        phone_number: req.body.phone_number,
                                        tags: tags,
                                        business: restaurantObject //Embed the restaurant information
                                    }
                                );

                                newBO.save()
                                    .then(function (response) {
                                        res.send({
                                            "error": false,
                                            "message": response.withoutPassword()
                                        });
                                    })
                                    .catch(function (error) {
                                        //Error because mail already registered (unique key conflict in Mongoose is error 11000).
                                        if (error.code === 11000) {
                                            res.status(400).send({"error": true, "message": "That mail is already registered"});
                                            return;
                                        }
                                        res.status(500).send({"error": true, "message": "Error creating business owner " + error});
                                    });
                            }
                            else{
                                //Error because another business owner has that restaurant
                                res.status(400).send({"error": true, "message": "The specified restaurant is already assigned to other BO"});
                            }
                        });

                }
                else{
                    //Error because could not find such restaurant
                    res.status(400).send({"error": true, "message": "The specified restaurant does not exist"});
                }
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error checking restaurant information"});
            })




    });


    /**
     * PUT /:email
     *
     * Updates a business owner.
     * Only updates attributes password, person_in_charge, phone_number and automatic_notifications.
     * Only updates those attributes that are passed. Any other is ignored and unchanged.
     *
     * Authentication: Yes
     * Permissions: Admin and the BO being modified
     */
    router.put("/:email",passport.authenticate('jwt', { session: false }));
    router.put("/:email",function (req,res) {
        if ((req.user.email !== req.params.email) && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }

        //There is no required parameter.

        var updateObject = {};

        //Update first_name if passed (No need to check string length, as length 0 is falsy in JS)
        if (req.body.person_in_charge_name){
            updateObject.person_in_charge_name = req.body.person_in_charge_name;
        }

        //Update phone_number if passed
        if (req.body.phone_number){
            updateObject.phone_number = req.body.phone_number;
        }
        //Update password if passed, setting the hash
        if (req.body.password){
            updateObject.password = crypto.createHash('md5').update(req.body.password).digest('hex');
        }

        if(req.body.tags){
            updateObject.tags = req.body.tags;
        }
        //Update automatic_notifications if passed
        if (req.body.automatic_notifications && req.body.automatic_notifications.length > 0){
            updateObject.automatic_notifications = req.body.automatic_notifications;
        }


        Business.findOneAndUpdate({email: req.params.email}, updateObject, {new:true})
            .then(function(response){

                if(!response){
                    res.status(404).send({"error": true, "message": "The business does not exist"});
                    return;
                }


                //Just send the updated data without password
                res.send({
                    "error": false,
                    "message": response.withoutPassword()
                });

            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error updating business " + error});
            });

    });

    /**
     * DELETE /:email - Deletes a business owner
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.delete("/:email",passport.authenticate('jwt', { session: false }));
    router.delete("/:email", function(req,res){

        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }

        Business.remove({email:req.params.email})
            .then(function(obj){

                if(obj.result.n === 0){
                    res.status(404).send({
                        "error": true,
                        "message": "Business owner does not exist"
                    });
                    return;
                }

                res.send({
                    "error": false,
                    "message": "Removed successfully"
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error removing business owner " + error});
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
                        var token = jwt.sign({ email: req.body.email, business: true }, config.jwtsecret);
        
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