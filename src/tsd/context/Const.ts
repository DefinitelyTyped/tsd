module tsd {
	'use strict';

	export var Const = {
		ident : 'tsd',
		configFile : 'tsd.json',
		cacheDir : 'tsd-cache',
		configSchemaFile : 'tsd-v4.json',

		typingsFolder : 'typings',
		configVersion: 'v4',
		definitelyRepo: 'borisyankov/DefinitelyTyped',
		mainBranch: 'master',

		shaShorten: 6
	 };
	//TODO add deepFreeze for safety
	//proper const
	Object.freeze(Const);
}
