# TSD

[![Build Status](https://secure.travis-ci.org/Diullei/tsd.png?branch=develop-0.5.x)](http://travis-ci.org/Diullei/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd)

> TypeScript Definition Package Manager

TSD is a [TypeScript](http://www.typescriptlang.org/) definition file package manager. Easily search and install community contributed definition files directly from the [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repository.

:bangbang: Version `0.5.x` is functional but still heavily in development and not ready for production-critical use. It might just work fine though.

:warning: Version `0.5.x` not backwards compatible with the config files from earlier versions (as the data source changed so much).

Use TSD as a CLI command `$ tsd`, similar to `$ npm` and `$ bower`. All functionality is also exported as a node.js module: `require('tsd')`. 

### Usage as CLI command

:x: Not yet on npm. ~~Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/):~~

	$ npm install tsd -g

:wrench: For development preview install from a git-checkout (at whatever state it is):

	$ npm install
	$ grunt build
	$ npm install . -g

:rocket: For npm preview install directly from github (if you feel particularly adventurous):

	$ npm install git://github.com/Diullei/tsd#develop-0.5.x -g

#### Commands

	$ tsd	
	$ tsd -h

:bangbang: Possibly outdated method list:

	$ tsd search <selector>
	$ tsd install <selector>
	$ tsd info <selector>
	$ tsd history <selector>
	$ tsd reinstall
	...

### Selector

:bangbang: Currently semver selection and ranking is not implemented (a case is the node.js 0.8 definition)


TSD uses selectors to query the definition list:

	$ tsd install project/module

Consider these definitions:
	
	project/module.d.ts
	project/module-0.1.2.d.ts
	project/module-0.1.2-alpha.d.ts
	project/module-addon.d.ts

	project-plugin/plugin.d.ts

	other/module.d.ts
	other/helper.d.ts
	other/plugin.d.ts

Notice the pattern, and ignore the `.d.ts` extension:

	<project>/<module><semver>.d.ts	

Select definitions using only the module name:

	module
	module-addon

Or use a selector derived from the path format:

	project/module

The selector also supports globbing, for example:

:bangbang: Currently globs implement only leading and trailing.

	project/*
	project*
	module*
	project/module*
	project-*/plugin*
	project*/*-*
	project/plugin*
	other/module
	*/module
	*/module-*
	*/*plugin

:x: Not yet. Note: the semver postfix is expected to be separated by a dash and possibly a `'v'`

	module-0.1.2
	module-0.1.2-alpha
	module-v0.1.2

:x: Not yet. ~~If there are multiple matches with same module name they will be prioritised:~~

1.	~~The unversioned name is considered being most recent.~~
2.	~~Then versions are compared as expected following these [comparison](https://github.com/isaacs/node-semver#comparison) rules.~~

## Use as module

Include TSD as any npm dependency in your project and create instances of the API class. The internal API use to implement the CLI is exposed. 
 
	var tsd = require('tsd');
	var api = new tsd.API(new tsd.Context('path/to/tsd-config.json'));
	api.search(new tsd.Selector('jquery/*')).then(function(res) {
		//yes
		util.inspect(res);

	}, function(err) {
		//this is bad
	});

TSD uses Promise/A+ by the excellent [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io) packages. :point_left::+1: 

### API docs 

:x: Not yet. 

## Build

TSD is written in [TypeScript](http://www.typescriptlang.org/) and build using [Grunt](http://www,gruntjs.com). All definition data pulled live from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) using the [Github API](http://developer.github.com/).

To rebuild clone or fork the repos:

	// install dependencies
	$ npm install

	// build and test
	$ grunt test

	// only rebuild
	$ grunt build

Either install global or use in dev folder:

	// run in dev folder
	$ node ./build/cli.js install angular --dev

	// install to globa;
	$ npm install . -g

TSD uses [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) to easily test separate test sets during development:
	
	// list aliases
	$ grunt -h

	// for example: run only api tests
	$ grunt gtx:api

## Contribute

Contributions will be welcome once the application architecture stabilises a bit more.

## Change log

### v0.5.0 (2013-08)

* Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).
* Moved to the DefinitelyTyped organisation

## License

Copyright (c) 2012 by Diullei Gomes

Licensed under the [MIT license](https://raw.github.com/Diullei/tsd/master/LICENSE.txt).
