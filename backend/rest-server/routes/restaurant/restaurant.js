/**
 * Router module that handles the RESTAURANT REST API
 */
var express = require('express');
var passport = require('passport');
var generateLinks = require('../linkGenerator');


module.exports = function (app) {

    var router = express.Router();

    var Restaurant = app.models.Restaurant; //Get Restaurant Model
    var Business = app.models.Business; //Get Business Model


    /**
     * GET / - Get all the restaurants
     *
     * Authentication: NO
     */
    router.get("/", function (req, res) {

        Restaurant.find({}, '_id name location price_level rating address permanently_closed')
            .then(function(response){

                res.send({
                    "error": false,
                    "message": response,
                    "_links": generateLinks({
                        self: "/restaurants"
                    })
                });
            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error retrieving restaurant data " + error});
            });

    });


    /**
     * GET /:id -  Get all info of a restaurant given its id
     *
     * Authentication: NO
     */
    //router.get("/:id",passport.authenticate('jwt', { session: false }));  //No authentication required at the moment
    router.get("/:id", function (req, res) {

        Restaurant.findOne({_id: req.params.id}, '_id name location price_level rating address permanently_closed')
            .then(function(result){

                if (!result) {
                    res.status(404).send({"error": true, "message": "The restaurant does not exist"});
                    return;
                }

                res.send({
                    "error": false,
                    "message": result,
                    "_links": generateLinks({
                        self: "/restaurants/" + req.params.id,
                        list: "/restaurants"
                    })
                });
            })
            .catch(function(err){
                res.status(500).send({"error": true, "message": "Error retrieving restaurant data"});
            });


    });


    /**
     * PUT /:id -> updates a single restaurant. Fields that can be updated are name, price_level, rating, permanently_closed.
     * These fields will only be updated if are passed and are not empty.
     * Any other field will be ignored.
     *
     * Also, updates the information inside the possible business owner that has the restaurant associated.
     *
     * Authentication: Yes
     * Permissions: Admin
     */
    router.put("/:id",passport.authenticate('jwt', { session: false }));
    router.put("/:id",function (req,res) {

        if (req.user.email !== 'admin@lime.com'){
            res.status(403).send({error: true, message: "You are not authorized to perform this action"});
            return;
        }

        //There is no required parameter.

        var updateObject = {};

        //Update name if passed
        if (req.body.name){
            updateObject.name = req.body.name;
        }

        //Update price_level if passed
        if (req.body.price_level){
            updateObject.price_level = req.body.price_level;
        }

        //Update rating if passed
        if (req.body.rating){
            updateObject.rating = req.body.rating;
        }
        //Update permanently_closed if passed
        if (req.body.permanently_closed!='null'){
            updateObject.permanently_closed = req.body.permanently_closed;
        }

        Restaurant.findOneAndUpdate({_id: req.params.id}, updateObject, {new:true})
            .then(function(response){

                if(!response){
                    res.status(404).send({"error": true, "message": "The restaurant does not exist"});
                    return;
                }

                //We successfully updated the data. Now, we update the data inside the business owner, if any
                return Business.findOneAndUpdate({"business._id":req.params.id},{$set: {business: response}})
                    .then(function(updatedBO){
                        //Just send back the updated data
                        res.send({
                            "error": false,
                            "message": response,
                            "_links": generateLinks({
                                self: "/restaurants/" + req.params.id,
                                list: "/restaurants"
                            })
                        });
                    });


            })
            .catch(function(error){
                res.status(500).send({"error": true, "message": "Error updating restaurant " + error});
            });

    });

    return router;
};