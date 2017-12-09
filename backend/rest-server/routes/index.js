/*
* Routes main module.
* This module is responsible for defining the routes and the routes that handle each of them.
*/
var config = require('../../config');
module.exports = function(app) {
    app.use("/users",require('./user/user')(app));
    app.use("/businesses",require('./business/business')(app));
    app.use("/location",require('./location/location')(app));
    app.use("/transactions",require('./transaction/transaction')(app));
    app.use("/wallets",require('./wallet/wallet')(app));
    app.use("/restaurants",require('./restaurant/restaurant')(app));

    // NOTE: The "real-time-heatmap API" is NOT part of the Web Services project
    app.use("/real-time-heatmaps",require('./real-time-heatmap/real-time-heatmap')(app));
    if(config.analytics_fake_data){
        app.use("/analytics",require('./analytics/fake_analytics')(app));
    }
    else{
        app.use("/analytics",require('./analytics/analytics')(app));
    }




};