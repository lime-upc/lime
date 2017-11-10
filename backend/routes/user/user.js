/**
 * Router module that handles the USER REST API
 */
var express = require('express');
var crypto = require('crypto');

module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User; //Get User Model



    /**
     * GET / - Get all users, without password
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.get("/", function (req, res) {
        User.find({}, 'email first_name last_name date_of_birth gender preferences')
            .then(function(response){
                if (!response) {
                    res.status(404).send({"error": true, "message": "The user does not exist"});
                    return;
                }

                res.send({
                    "error": false,
                    "message": response
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving user data " + error});
            });



    });

    /**
     * POST / = Creates new user
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
                });

                return;

        }

        //ERROR: Empty list of preferences
        if(req.body.preferences && req.body.preferences.length === 0){
            res.status(400).send({
                "error": true,
                "message": "Preferences must have at least one element"
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
                preferences: req.body.preferences
            }
        );


        newUser.save()
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
                res.status(500).send({"error": true, "message": "Error creating user " + error});
            });


    });

    /**
     * GET /:email -  Get all info of a user (except password)
     *
     * Authentication: Yes
     * Permissions: The own user, Admin
     */
    router.get("/:email", function (req, res) {


        User.findOne({email: req.params.email}, 'email first_name last_name date_of_birth gender preferences')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The user does not exist"});
                    return;
                }

                res.send({
                    "error": false,
                    "message": result.withoutPassword()
                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving user data"});
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
    router.put("/:email",function (req,res) {

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


        User.findOneAndUpdate({email: req.params.email}, updateObject, {new:true})
            .then(function(response){



                //Just send the updated data without password
                res.send({
                    "error": false,
                    "message": response.withoutPassword()
                });

            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error updating user " + error});
            });



    });





    /**
     * DELETE /:email - Deletes a user
     *
     * Authentication: YES
     * Permissions: Admin
     */
    router.delete("/:email", function(req,res){

        User.remove({email:req.params.email})
            .then(function(obj){
                res.send({
                    "error": false,
                    "message": "Removed " + obj.result.n + " users"
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error removing user " + error});
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
            });

            return;
        }

        //Retrieve email from database
        User.findOne({email:req.body.email})
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

                //No error
                res.send({
                    "error": false,
                    "message": "Logged successfully"
                });


            })
            .catch(function(error){

            });



    });






    return router;
};