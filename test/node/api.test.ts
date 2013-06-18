///<reference path="../_ref.ts" />

declare var assert:chai.Assert;

var tsd = require("../../deploy/tsd");

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var _:UnderscoreStatic = <any>require('../../libs/underscore');

describe('api', () =>{
    var cwd = <any>process.cwd();
    var schema;

    var remoteRepo = "http://www.tsdpm.com/repository_v3.json";
    remoteRepo = "http://localhost:63342/tsd-origin/repo/repository_v3.json";
    remoteRepo = "file:///" + encodeURI(path.resolve("./repo/repository_v3.json").replace(/\\/g, '/'));

    console.log('-> using repo: ' + remoteRepo);

    function getConfig(){
        return {
            "version": "v3",
            "typingsPath": "typings",
            "repo": {
                "uriList": [
                    remoteRepo
                ]
            }
        };
    }

    function clean(done){
        rimraf("typings", function (err){
            if (err) throw new Error('Unable to remove test directory');
            if (fs.existsSync('tsd-config.json')) {
                fs.unlinkSync('tsd-config.json');
            }
            done();
        });
    }

    before(function (done){
        schema = {
            repo_data: helper.readJSON('./schema/repo_data.json'),
            tsd_config: helper.readJSON('./schema/tsd-config_v3.json'),
            repository_v3: helper.readJSON('./schema/repository_v3.json')
        };
        process.chdir(path.join("test/node"));
        clean(done);
    });

    after(function (done){
        process.chdir(cwd);
        schema = null;
        done();
    });

    describe('pre validate', () =>{
        it('Should use tsd', () => {
            assert.ok(tsd, 'tsd');
        });

        it('Should use valid data format', (done) => {
            var source = tsd.source.DataSourceFactory.factory(remoteRepo);
            assert.ok(source, 'DataSource');
            source.content(function(err, data){
                assert.isNull(err, 'error');
                assert.isNotNull(data, 'data');

                var obj = JSON.parse(data);
                assert.ok(obj, 'obj');

                assert.jsonSchema(obj, schema.repository_v3, 'DataSource');

                done();
            });
        });
    });

    describe('load-config', () =>{

        it('Should use valid config', () =>{
            assert.jsonSchema(getConfig(), schema.tsd_config, 'getConfig()');
        });

        it('Should call load config callback', (done) =>{
            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');
                done();
            });
        });
    });

    describe('all', () =>{

        it('Should list all available typings', (done) =>{
            tsd.load(getConfig(), function (err, tsd){
                if (err) console.log(err);
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.all(function (err, data){
                    if (err) console.log(err);
                    assert.isNull(err, 'error');
                    assert.isNotNull(data, 'data');

                    assert.isArray(data, 'data');
                    assert.operator(data.length, '>', 1, data.length);

                    //needs deeper content testing (schema!)

                    done();
                });
            });
        });

        it('Should emit "end" event', (done) =>{
            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.all()
                    .on('error', function (err){
                        //assert? fail?
                    })
                    .on('end', function (data){
                        //assert data?
                        done();
                    });
            });
        });
    });

    describe('install', () =>{

        beforeEach(function (done){
            clean(done);
        });

        it('Should install jquery and backbone typings', (done) =>{

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["jquery", "backbone"], function (err, data){
                    assert.isNull(err, 'error');

                    assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "jquery", "jquery.d.ts")), 'installed jquery');
                    assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "backbone", "backbone.d.ts")), 'installed backbone');

                    var config = helper.readJSON('tsd-config.json');
                    assert.ok(config);
                    assert.jsonSchema(config, schema.tsd_config);

                    done();
                });
            });
        });

        it('Should emit "end" event', (done) =>{

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["jquery"])
                    .on('error', function (err){
                    })
                    .on('end', function (data){
                        assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "jquery", "jquery.d.ts")), 'installed jquery');

                        var config = helper.readJSON('tsd-config.json');
                        assert.ok(config);
                        assert.jsonSchema(config, schema.tsd_config);

                        done();
                    });
            });
        });

        it('Should emit "error" event', (done) =>{

            var cfg = {
                "version": "v3",
                "typingsPath": "typings",
                "repo": {
                    "uriList": [
                        "http://www.tsdpm.com/repository_vx.json"
                    ]
                }
            };
            assert.jsonSchema(cfg, schema.tsd_config, 'cfg');

            tsd.load(cfg, function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["notexists"])
                    .on('error', function (err){
                        done();
                    })
                    .on('end', function (data){
                    });
            });
        });

        it('Callback "data" parameter should return installed informations', (done) =>{

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["jquery"], function (err, data){
                    assert.isNull(err, 'error');

                    var expected = {
                        typings: {
                            "jquery@1.9": {
                                "repo": remoteRepo,
                                "key": "ab94ec25-d89a-483d-a904-66db6d77a174",
                                "uri": "https://github.com/borisyankov/DefinitelyTyped/raw/master/jquery/jquery.d.ts"
                            }
                        }
                    };

                    assert.deepEqual(expected, data);
                    done();
                });
            });
        });

        it('Should save dependencies to the json', function (done){

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["jquery"], function (err, data){
                    assert.isNull(err, 'error');

                    var json = helper.readJSON("tsd-config.json");

                    assert.jsonSchema(json, schema.tsd_config);

                    assert.ok(json.dependencies);

                    var ok = false;
                    for (var attr in json.dependencies) {
                        if (attr.substr(0, 6) == "jquery") {
                            ok = true;
                        }
                    }

                    assert.isTrue(ok);
                    done();
                });
            });
        });

        it('Should install typings dependencies', (done) =>{

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["express"], "*")
                    .on('error', function (err){
                    })
                    .on('end', function (data){
                        assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "express")));
                        assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "node")));
                        done();
                    });
            });
        });

        it('Should install typings dependencies with callback', (done) =>{

            tsd.load(getConfig(), function (err, tsd){
                assert.isNull(err, 'error');
                assert.isNotNull(tsd, 'tsd');

                tsd.commands.install(["express"], "*", function (err, data){
                    assert.isNull(err, 'error');

                    assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "express")));
                    assert.isTrue(fs.existsSync(path.join("typings", "DefinitelyTyped", "node")));
                    done();
                });
            });
        });
    });
});
