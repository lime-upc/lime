var downloader = require("./dataDownloader");
var updater = require("./SpatialDBupdater");


downloader()
    .then(function(res){
            return updater(res);
    });