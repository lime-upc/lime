/*
* Main models module.
* This file is used to centralize all the Mongoose models, so, when using of
* the models from outside, the only thing to import is this file.
* Important: When adding a new model, add it also here, like in user.js
*/


module.exports = {
    User: require('./user.js'),
    Business: require('./business.js')
};