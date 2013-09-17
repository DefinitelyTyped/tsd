module tsd {
	export var Const = {
		ident : 'tsd',
		configFile : 'tsd-config.json',
		cacheDir : 'tsd-cache',
		configSchemaFile : 'tsd-config_v4.json',

		typingsFolder : 'typings',
		configVersion: 'v4',
		definitelyRepo: 'borisyankov/DefinitelyTyped',
		mainBranch: 'master'
	 };
	//proper const
	Object.freeze(Const);
}