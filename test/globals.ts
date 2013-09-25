///<reference path="_ref.d.ts" />

///<reference path="../src/bootstrap.ts" />
///<reference path="helper.ts" />
///<reference path="settings.ts" />

///<reference path="../src/xm/io/Logger.ts" />
///<reference path="../src/xm/typeOf.ts" />
///<reference path="../src/xm/assertVar.ts" />

require('mocha-as-promised')();

///TODO fix this weird stuff
declare var helper:helper;
//declare var assert:chai.Assert;

var chai = require('chai');
chai.use(require('chai-fuzzy'));
chai.use(require('chai-json-schema'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
chai.Assertion.includeStack = true;

var assert:chai.Assert = <chai.Assert>chai.assert;

before(() => {
	///..
});