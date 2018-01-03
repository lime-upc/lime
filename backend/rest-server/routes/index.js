/*
* Routes main module.
* This module is responsible for defining the routes and the routes that handle each of them.
*/
var config = require('../../config');
module.exports = function(app) {



    app.use("/users",require('./user/user')(app));
    app.use("/businesses",require('./business/business')(app));
    app.use("/transactions",require('./transaction/transaction')(app));
    app.use("/wallets",require('./wallet/wallet')(app));
    app.use("/restaurants",require('./restaurant/restaurant')(app));


    /** NOTE: The routes below are NOT PART of the Web Services project **/

    app.use("/location",require('./location/location')(app));


    if(config.heatmap_fake_data){
        app.use("/real-time",require('./real-time/fake-real-time-heatmap')(app));
    }
    else{
        app.use("/real-time",require('./real-time/real-time-heatmap')(app));
    }
   
    app.use("/analytics",require('./analytics/analytics')(app));
    






};