/// <reference path="../_ref.d.ts" />

import bootstrap = require('../src/bootstrap');

/// <reference path="settings.ts" />

import chai = require('chai');
chai.use(require('chai-fuzzy'));
chai.use(require('chai-json-schema'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));
chai.Assertion.includeStack = true;

before(() => {
	///..
});
