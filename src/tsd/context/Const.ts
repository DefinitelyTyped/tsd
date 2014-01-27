module tsd {
	'use strict';

	export var Const = {
		ident : 'tsd',
		configFile : 'tsd.json',
		typingsDir : 'typings',
		cacheDir : 'tsd-cache',

		settings : 'settings.json',

		configVersion: 'v4',
		configSchemaFile : 'tsd-v4.json',
		definitelyRepo: 'borisyankov/DefinitelyTyped',
		mainBranch: 'master',

		shaShorten: 6
	 };
	// brrrrr
	Object.freeze(Const);
}
