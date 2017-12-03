/*
* Routes main module.
* This module is responsible for defining the routes and the routes that handle each of them.
*/
module.exports = function(app) {
    app.use("/users",require('./user/user')(app));
    app.use("/businesses",require('./business/business')(app));
    app.use("/location",require('./location/location')(app));
    app.use("/transactions",require('./transaction/transaction')(app));
    app.use("/wallets",require('./wallet/wallet')(app));
    app.use("/restaurants",require('./restaurant/restaurant')(app));

/*
    Sample code from a previous project.
    app.use("/pois",require('./poi/poi')(app));
    app.use("/pois/:id/ratings",require('./poi/rating')(app));
    app.use("/guests",require('./guest/guest')(app));
    app.use("/guests/:guestMail/favs",require('./guest/favourite')(app));
    app.use("/guests/:guestMail/following",require('./guest/following')(app));
    app.use("/routes",require('./route/route')(app));
    app.use("/stats/admin",require('./stats/admin/adminStats')(app));
    app.use("/stats/users/:username/routes",require('./stats/user/routeStats')(app));
    app.use("/stats/users/:username/pois",require('./stats/user/poiStats')(app));*/


};