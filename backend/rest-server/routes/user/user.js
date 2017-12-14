/**
 * Router module that handles the USER REST API and USER LOGIN
 */
var express = require('express');
var crypto = require('crypto');
var config = require('../../../config');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var generateLinks = require('../linkGenerator');

module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User; //Get User Model
    var Wallet = app.models.Wallet;
    var Restaurant = app.models.Restaurant;



    /**
     * GET / - Get all users, without password
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.get("/",passport.authenticate('jwt', { session: false }));
    router.get("/", function (req, res) {



        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }


        User.find({}, 'email first_name last_name date_of_birth gender preferences')
            .then(function(response){


                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({self:"/users"})
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving user data " + error,"_links": generateLinks({list: "/users"})});
            });



    });

    /**
     * POST / = Creates new user and its wallet
     *
     * Authentication: No
     * Permissions: Everybody
     */

    router.post("/", function(req,res){

        //Check that all the fields in request are completed
        if (  !req.body.email  || !req.body.first_name || !req.body.last_name || !req.body.password ||
                !req.body.date_of_birth || !req.body.gender || !req.body.preferences) {

                res.status(400).send({
                    "error": true,
                    "message": "All the parameters are required"
                    ,"_links": generateLinks({list: "/users"})
                });

                return;

        }

        //ERROR: Empty list of preferences
        if(req.body.preferences && req.body.preferences.length === 0){
            res.status(400).send({
                "error": true,
                "message": "Preferences must have at least one element"
                ,"_links": generateLinks({list: "/users"})
            });

            return;
        }

        //Create password hash
        var passHash = crypto.createHash('md5').update(req.body.password).digest('hex');

        //Create Mongoose object
        var newUser = new User(
            {
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                password: passHash,
                date_of_birth: new Date(req.body.date_of_birth),
                gender: req.body.gender,
                preferences: req.body.preferences,
                likes: [] //Starts with empty likes
            }
        );


        newUser.save()
            .then(function(response){

                //Create new, empty wallet
                var wallet = new Wallet(
                    {
                        email: req.body.email,
                        balance_amount: 10,
                        total_money_received: 0,
                        total_money_spent: 0
                    }
                );


                //Creates a new wallet also
                return wallet.save()
                    .then(function(){
                        res.send({
                            "error": false,
                            "message": response.withoutPassword(),
                            "_links": generateLinks({
                                self:"/users" + response.email,
                                likes: "/users/" + response.email + "/likes",
                                wallet: "/wallets/" + response.email,
                                list: "/users"
                            })
                        });
                    });



            })
            .catch(function(error){
                //Error because mail already registered (unique key conflict in Mongoose is error 11000).
                if ( error.code === 11000 ) {
                    res.status(400).send({"error": true, "message": "That mail is already registered","_links": generateLinks({list: "/users"})});
                    return;
                }
                res.status(500).send({"error": true, "message": "Error creating user " + error,"_links": generateLinks({list: "/users"})});
            });


    });

    /**
     * GET /:email -  Get all info of a user (except password)
     *
     * Authentication: Yes
     * Permissions: The own user, Admin
     */
    router.get("/:email",passport.authenticate('jwt', { session: false }));
    router.get("/:email", function (req, res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }


        User.findOne({email: req.params.email}, 'email first_name last_name date_of_birth gender preferences')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The user does not exist","_links": generateLinks({list: "/users"})});
                    return;
                }

                res.send({
                    "error": false,
                    "message": result.withoutPassword(),
                    "_links": generateLinks({
                        self:"/users" + result.email,
                        likes: "/users/" + result.email + "/likes",
                        wallet: "/wallets/" + result.email,
                        list: "/users"
                    })
                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving user data","_links": generateLinks({list: "/users"})});
            });


    });



    /**
     * PUT /:email -> updates a single user. Fields that can be updated are first_name, last_name, password,
     * date_of_birth, gender and preferences.
     * These fields will only be updated if are passed and are not empty.
     * Any other field will be ignored.
     *
     * Authentication: Yes
     * Permissions: Admin and the own user
     */
    router.put("/:email",passport.authenticate('jwt', { session: false }));
    router.put("/:email",function (req,res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }

        //There is no required parameter.

        var updateObject = {};

        //Update first_name if passed (No need to check string length, as length 0 is falsy in JS)
        if (req.body.first_name){
            updateObject.first_name = req.body.first_name;
        }

        //Update last_name if passed
        if (req.body.last_name){
            updateObject.last_name = req.body.last_name;
        }

        //Update date_of_birth if passed
        if (req.body.date_of_birth){
            updateObject.date_of_birth = new Date(req.body.date_of_birth);
        }

        //Update gender if passed
        if (req.body.gender){
            updateObject.gender = req.body.gender;
        }

        //Update preferences if passed
        if (req.body.preferences && req.body.preferences.length > 0){
            updateObject.preferences = req.body.preferences;
        }

        //Update password if passed, setting the hash
        if (req.body.password){
            updateObject.password = crypto.createHash('md5').update(req.body.password).digest('hex');
        }


        //Cannot update likes as that is done through the likes API

        User.findOneAndUpdate({email: req.params.email}, updateObject, {new:true})
            .then(function(response){

                if(!response){
                    res.status(404).send({"error": true, "message": "The user does not exist"});
                    return;
                }


                //Just send the updated data without password
                res.send({
                    "error": false,
                    "message": response.withoutPassword(),
                    "_links": generateLinks({
                        self:"/users" + response.email,
                        likes: "/users/" + response.email + "/likes",
                        wallet: "/wallets/" + response.email,
                        list: "/users"
                    })
                });

            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error updating user " + error,"_links": generateLinks({list: "/users"})});
            });



    });





    /**
     * DELETE /:email - Deletes a user
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.delete("/:email",passport.authenticate('jwt', { session: false }));
    router.delete("/:email", function(req,res){

        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }

        User.remove({email:req.params.email})
            .then(function(obj){

                if(obj.result.n === 0){
                    res.status(404).send({
                        "error": true,
                        "message": "User does not exist"
                    });
                    return;
                }

                res.send({
                    "error": false,
                    "message": "Removed successfully",
                    "_links": generateLinks({
                         list: "/users"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error removing user " + error,"_links": generateLinks({list: "/users"})});
            });
    });


    /**
     * POST /login - Authenticates the user
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
                ,"_links": generateLinks({list: "/users"})
            });

            return;
        }

        //Retrieve email from database
        User.findOne({email:req.body.email})
            .then(function(result){

                //ERROR: No result, so the username does not exist
                if(!result){
                    res.status(401).send({"error": true, "message": "Incorrect email or password","_links": generateLinks({list: "/users"})});
                    return;
                }

                var hash = crypto.createHash('md5').update(req.body.password).digest('hex');

                //ERROR: Password is incorrect
                if (hash !== result.password){
                    res.status(401).send({"error": true, "message": "Incorrect email or password","_links": generateLinks({list: "/users"})});
                    return;
                }

                //No error. Generate JWT with email
                var token = jwt.sign({ email: req.body.email, business: false }, config.jwtsecret);

                res.send({
                    "error": false,
                    "message": token,
                    "_links": generateLinks({
                        user: "/users/"+ req.body.email
                    })
                });

            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error removing user " + error,"_links": generateLinks({list: "/users"})});

            });


    });


    //Likes functions


    /**
     * GET /:email/likes -  Get info of liked restaurants by a user
     *
     * Authentication: Yes
     * Permissions: The own user, Admin
     */
    router.get("/:email/likes",passport.authenticate('jwt', { session: false }));
    router.get("/:email/likes", function (req, res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }


        User.findOne({email: req.params.email}, 'likes')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The user does not exist","_links": generateLinks({list: "/users"})});
                    return;
                }

                res.send({
                    "error": false,
                    "message": result.likes,
                    "_links": generateLinks({
                        self: "/users/" + req.user.email + "/likes/",
                        user: "/users/"+ req.user.email
                    })

                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving user likes","_links": generateLinks({list: "/users"})});
            });


    });

    /**
     * POST /:email/likes/:restaurantId -  Adds a restaurant as liked to a user's profile
     *
     * Authentication: Yes
     * Permissions: The own user, Admin
     */
    router.post("/:email/likes/:restaurantId",passport.authenticate('jwt', { session: false }));
    router.post("/:email/likes/:restaurantId", function (req, res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }


        //Check that the restaurant exists
        Restaurant.findOne({_id: req.params.restaurantId})
            .then(function(result){

                if(!result){
                    res.status(404).send({error: true, message: "The specified restaurant does not exist in our DB.","_links": generateLinks({list: "/users"})});
                    return;
                }

                //Get the likes array
                return User.findOne({email: req.params.email}, 'likes')
                    .then(function(result){

                        if (!result) {
                            res.status(404).send({"error": true, "message": "The user does not exist","_links": generateLinks({list: "/users"})});
                            return;
                        }

                        var likes = result.likes;
                        if(likes.indexOf(req.params.restaurantId)<0){
                            likes.push(req.params.restaurantId); //If not already, we set
                        }

                        //Update the user
                        return User.findOneAndUpdate({email: req.params.email},{$set:{likes:likes}}, {new:true})
                            .then(function(result){
                                res.send({
                                    "error": false,
                                    "message": result.likes,
                                    "_links": generateLinks({
                                        self: "/users/" + req.user.email + "/likes/",
                                        user: "/users/"+ req.user.email
                                    })
                                });
                            });


                    })


            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error adding user like","_links": generateLinks({list: "/users"})});
            });





    });

    /**
     * DELETE /:email/likes/:restaurantId -  Removes a restaurant as liked from a user's profile
     *
     * Authentication: Yes
     * Permissions: The own user, Admin
     */
    router.delete("/:email/likes/:restaurantId",passport.authenticate('jwt', { session: false }));
    router.delete("/:email/likes/:restaurantId", function (req, res) {

        if (req.user.email !== req.params.email && req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action","_links": generateLinks({list: "/users"})});
            return;
        }


        //Get the likes array
        User.findOne({email: req.params.email}, 'likes')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The user does not exist","_links": generateLinks({list: "/users"})});
                    return;
                }

                var likes = result.likes;
                var index = likes.indexOf(req.params.restaurantId);
                if(index > -1){
                    likes.splice(index,1);
                }

                //Update the user
                return User.findOneAndUpdate({email: req.params.email},{$set:{likes:likes}}, {new:true})
                    .then(function(result){
                        res.send({
                            "error": false,
                            "message": result.likes,
                            "_links": generateLinks({
                                self: "/users/" + req.user.email + "/likes/",
                                user: "/users/"+ req.user.email
                            })
                        });
                    });


            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error removing user like","_links": generateLinks({list: "/users"})});
            });





    });


    return router;
};