///<reference path="../typings/DefinitelyTyped/node/node.d.ts" />
///<reference path="../typings/DefinitelyTyped/mocha/mocha.d.ts" />
///<reference path="../typings/DefinitelyTyped/underscore/underscore.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-fuzzy-assert.d.ts" />

///<reference path="_helper.ts" />

var chaii = require('chai');
chaii.use(require('chai-fuzzy'));
var assert = chaii.assert;

process.env['mocha-unfunk-color'] = true;
