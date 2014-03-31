/// <reference path="../_ref.d.ts" />

'use strict';

var Const = {
	rc: '.tsdrc',
	ident: 'tsd',
	configFile: 'json',
	typingsDir: 'typings',
	cacheDir: 'tsd-cache',
	bundleFile: 'tsd.d.ts',

	settings: 'settings.json',

	configVersion: 'v4',
	configSchemaFile: 'tsd-v4.json',
	definitelyRepo: 'borisyankov/DefinitelyTyped',
	mainBranch: 'master',
	statsDefault: true,

	shaShorten: 6
};
// brrrrr
Object.freeze(Const);

export = Const;
