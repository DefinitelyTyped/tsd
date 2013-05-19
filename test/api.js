var tsd = require("../deploy/api");

var config = {
    "version": "v2",
    "typingsPath": "typings",
    "libPath": "lib",
    "repo": {
        "uriList": [{
                "sourceType": "1", /* 0 = file system; 1 = file on web; */
                "source": "http://www.tsdpm.com/repository_v2.json"
            }
        ]
    }
};


tsd.load(config, function (tsd, er) {
    if (er) {
        console.log("error trying initialize api");
        return;
    }

    tsd.commands.install(["backbone", "express", "node", "jquery", "express"], function (er, data) {
        if (er) {
            console.log("install error");
            return;
        }
        console.log("command succeeded!");
    });

    tsd.on('log', function (message) {
        console.log('# [api log] : ' + message);
    });
});
