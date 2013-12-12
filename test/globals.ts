/// <reference path="_ref.d.ts" />

/// <reference path="../src/bootstrap.ts" />

/// <reference path="../src/xm/Logger.ts" />
/// <reference path="../src/xm/collection.ts" />
/// <reference path="../src/xm/typeOf.ts" />
/// <reference path="../src/xm/date.ts" />
/// <reference path="../src/xm/assertVar.ts" />
/// <reference path="../src/xm/iterate.ts" />

/// <reference path="settings.ts" />

var chai:Chai.ChaiStatic = require('chai');
chai.use(require('chai-fuzzy'));
chai.use(require('chai-json-schema'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
chai.Assertion.includeStack = true;

before(() => {
	///..
});
