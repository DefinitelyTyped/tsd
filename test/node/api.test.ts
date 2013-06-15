///<reference path="../_ref.ts" />

declare var assert:chai.Assert;

var _:UnderscoreStatic = <any>require('../../libs/underscore');

describe('verify repo', () =>{

    var fs = require('fs');
    var path = require('path');

    before(()=>{

    });
    describe('source data', () =>{
        it('has content', () =>{
            //dummy for now
            assert.ok('yes');
        });
    });
});