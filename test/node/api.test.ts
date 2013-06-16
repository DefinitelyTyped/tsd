///<reference path="../_ref.ts" />

declare var assert:chai.Assert;

var tsd = require("../../deploy/tsd");

var fs = require('fs');
var path = require('path');
var rimraf  = require('rimraf');

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
    var cwd = <any>process.cwd();

    function clean(done) {
        rimraf("typings", function (err) {
            if (err) throw new Error('Unable to remove test directory');
            done();
        });
    }

    beforeEach(function (done) {
        process.chdir(path.join("test/node"));
        clean(done);
    });

    after(function (done) {
        process.chdir(cwd);
        done();
    });

    describe('install', () =>{

        it('Should install jquery typing', (done) =>{
            this.timeout(0);

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                tsd.commands.install(["jquery"], function (er, data) {
                if (er) throw er;
                    assert.ok(fs.existsSync(path.join("typings", "DefinitelyTyped", "jquery")));
                    done();
                });
            });

        });
    });
});
