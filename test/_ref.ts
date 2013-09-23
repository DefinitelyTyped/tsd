///<reference path="../typings/DefinitelyTyped/node/node.d.ts" />
///<reference path="../typings/DefinitelyTyped/underscore/underscore.d.ts" />

///<reference path="../typings/DefinitelyTyped/mocha/mocha.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-json-schema-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-fuzzy-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-fs-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-as-promised-assert.d.ts" />

///<reference path="../src/bootstrap.ts" />

///<reference path="../src/xm/io/Logger.ts" />
///<reference path="helper.ts" />

///TODO fix this weird stuff
declare var helper:helper;
//declare var assert:chai.Assert;

var chai = require('chai');
chai.use(require('chai-fuzzy'));
chai.use(require('chai-json-schema'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
chai.Assertion.includeStack = true;

var assert:chai.Assert = chai.assert;

require('mocha-as-promised')();

before(() => {

});
