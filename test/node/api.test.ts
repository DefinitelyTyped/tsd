///<reference path="../_ref.ts" />

declare var assert:chai.Assert;

var tsd = require("../../deploy/tsd");

var fs = require('fs');
var path = require('path');

var _:UnderscoreStatic = <any>require('../../libs/underscore');

// tsd config
var config = {
    "version": "v2",
    "typingsPath": "typings",
    "libPath": "lib",
    "repo": {
        "uriList": [{
                "sourceType": "1",
                "source": "http://www.tsdpm.com/repository_v2.json"
            }
        ]
    }
};

describe('api', () =>{

    describe('install', () =>{
        it('Should install jquery typing', (done) =>{

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                tsd.commands.install(["jquery"], function (er, data) {
                if (er) throw er;
                    assert.ok(fs.existsSync(path.join(config.typingsPath, "jquery")));
                    done();
                });
            });
        });
    });
});
