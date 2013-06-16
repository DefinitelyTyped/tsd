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
            setTimeout(done, 100);
        });
    }

    before(function (done) {
        process.chdir(path.join("test/node"));
        clean(done);
    });

    after(function (done) {
        process.chdir(cwd);
        done();
    });

    describe('load-config', () =>{

        it('Should call load config callback', (done) =>{

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                done();
            });
        });

        it('Callback "tsd" parameter cannot be null' , (done) =>{

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                assert.isNotNull(tsd);
                done();
            });
        });
    });

    describe('install', () =>{

        it('Should install jquery and backbone typings', (done) =>{

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                tsd.commands.install(["jquery", "backbone"], function (er, data) {
                    if (er) throw er;

                    assert.ok(fs.existsSync(path.join("typings", "DefinitelyTyped", "jquery", "jquery.d.ts")));
                    assert.ok(fs.existsSync(path.join("typings", "DefinitelyTyped", "backbone", "backbone.d.ts")));
                    done();
                });
            });
        });

        it('Callback "data" parameter should return installed informations', (done) =>{

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                tsd.commands.install(["jquery"], function (er, data) {
                    if (er) throw er;

                    var expected = {
                        typings: {
                            "jquery@1.9": {
                                "repo": {
                                    "sourceType": "1",
                                    "source": "http://www.tsdpm.com/repository_v2.json"
                                },
                                "key": "ab94ec25-d89a-483d-a904-66db6d77a174",
                                "uri": {
                                    "source": "https://github.com/borisyankov/DefinitelyTyped/raw/master/jquery/jquery.d.ts",
                                    "sourceType": 1
                                }
                            }
                        }
                    };

                    assert.deepEqual(expected, data);
                    done();
                });
            });
        });

        it('Should save dependencies to the json', function (done) {

            tsd.load(config, function (tsd, er) {
                if (er) throw er;

                tsd.commands.install(["jquery"], function (er, data) {
                    if (er) throw er;
                    
                    var json = JSON.parse(fs.readFileSync("tsd-config.json"));
                    assert.ok(json.dependencies);

                    var ok = false;
                    for(var attr in json.dependencies) {
                        if(attr.substr(0, 6) == "jquery") {
                            ok = true;
                        }
                    }

                    assert.ok(ok);
                    done();
                });
            });
        });
    });
});
