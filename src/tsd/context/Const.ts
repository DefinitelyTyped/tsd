module tsd {
	'use strict';

	export var Const = {
		rc : '.tsdrc',
		ident : 'tsd',
		configFile : 'tsd.json',
		typingsDir : 'typings',
		cacheDir : 'tsd-cache',
		bundleFile: 'tsd.d.ts',

		settings : 'settings.json',

		configVersion: 'v4',
		configSchemaFile : 'tsd-v4.json',
		definitelyRepo: 'borisyankov/DefinitelyTyped',
		mainBranch: 'master',
		statsDefault: true,

		shaShorten: 6
	 };
	// brrrrr
	Object.freeze(Const);
}
