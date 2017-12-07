var downloader = require("./dataDownloader");
var loader = require("./SpatialDBloader");


downloader()
    .then(function(res){
            return loader(res);
    });