///<reference path="../typings/DefinitelyTyped/node/node.d.ts" />
///<reference path="../typings/DefinitelyTyped/mocha/mocha.d.ts" />
///<reference path="../typings/DefinitelyTyped/underscore/underscore.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-json-schema-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-fuzzy-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-fs-assert.d.ts" />
///<reference path="../typings/DefinitelyTyped/chai/chai-as-promised-assert.d.ts" />

///<reference path="helper.ts" />
///<reference path="../src/xm/io/Logger.ts" />

//declare var assert:chai.Assert;

var mkdirp = require('mkdirp');

var chai = require('chai');
chai.use(require('chai-fuzzy'));
chai.use(require('chai-json-schema'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
chai.Assertion.includeStack = true;
var assert:chai.Assert = chai.assert;
declare var helper:helper;
require('mocha-as-promised')();
require('source-map-support').install();

before(() => {
	// create some empty dirs (cannot check-in empty dirs to git)
	//mkdirp.sync('./tmp');

	mkdirp.sync('./test/tmp');
	assert.isDirectory('./test/tmp');
});