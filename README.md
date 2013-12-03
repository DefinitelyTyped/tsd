# TSD

[![Build Status](https://secure.travis-ci.org/DefinitelyTyped/tsd.png?branch=develop-0.5.x)](http://travis-ci.org/DefinitelyTyped/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd)

> TypeScript Definition Package Manager

TSD is a [TypeScript](http://www.typescriptlang.org/) definition file package manager. Search and install community contributed definition files directly from the [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) Github repository. TSD works as a CLI command `$ tsd` similar to `$ npm` and `$ bower`. All functionality is also exported as a node.js module. 

*Note:* the Github API has a 60 requests-per-hour [rate-limit](http://developer.github.com/v3/#rate-limiting) for non-authenticated use. To keep within this limit TSD employs both local and http caching layers. The actual definition files are downloaded over the Github RAW service (also with local and http cache). We are looking into a API proxy service for the incidental rate-limit overflow.

:bangbang: Version `0.5.x` not backwards compatible with the config files from earlier versions (as the data source changed so much).

**Preview notes** :warning: 

* Version `0.5.x` is functional and usable but still in development:
	*	If you decide to use it be sure to update regularly.
	*	There will be bugs and quirks. We do out best to remove the bugs.
* It is recommended you check-in any definitions you install into your VCS:
	*	As we link directly to the [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repo files may get moved or renamed. 
	*	The new `tsd.json` format knows the commit + path so should be able to find the correct file, but this might not be implemented yet.

### API change

* First versions of `0.5.x` has similar CLI commands to older version of TSD by having separate search/install commands
* From `> 0.5.2` all CLI search-based features are bundled under the `query` command (see below)

### Usage as CLI command

:x: Not yet on npm. ~~Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/):~~

	$ npm install tsd -g

:rocket: For npm preview install directly from github (if you feel particularly adventurous):

	$ npm install git://github.com/DefinitelyTyped/tsd#develop-0.5.x -g

#### Call CLI

Global `tsd` binary, view the help:

	$ tsd	
	$ tsd -h

:wrench: For development from a local install/checkout:

	$ node ./build/cli.js

#### Examples:

Minimal search for 'bootstrap'
		
	$ tsd query bootstrap

Get some info
		
	$ tsd query bootstrap --info --history --resolve
	$ tsd query bootstrap -i -h -r
	
Install 'bootstrap' definitions:

	$ tsd query bootstrap --action install
	$ tsd query bootstrap -a install

Install and install the reference to 'jquery', overwrite existing files and save to the tsd.config

	$ tsd query bootstrap --resolve --overwrite --save --action install
	$ tsd query bootstrap -r -o -s -a install

Search search for jquery plugins:
		
	$ tsd query */jquery.*

### Selector explained

TSD uses a globbing selector to query the definition list:

	$ tsd query project/module

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

:bangbang: Globbing implements only leading and trailing (for now).

### Semver

Note: the semver postfix is expected to be separated by a dash and possibly a `'v'`

	module-0.1.2
	module-v0.1.2
	module-v0.1.2-alpha

If there are multiple matches with same module name they will be prioritised:

1.	The unversioned name is considered being most recent.
2.	Then versions are compared as expected following these [comparison](https://github.com/isaacs/node-semver#comparison) rules.
3.	Use the `--version` argument to supply a semver-range:

````
$ tsd query node -v latest
$ tsd query node -v all
$ tsd query node -v ">=0.8 <0.10"
````
## Use as module

:bangbang: Outdated info until after we push out the preview release, but intended to work (as it is a key to some planned dependencies).
 
TSD can be used as any JavaScript npm dependency in your project: the API used to implement the CLI is exposed: 

````js
var tsd = require('tsd');
var api = new tsd.API(new tsd.Context('path/to/tsd-config.json'));
api.search(new tsd.Selector('jquery/*')).then(function(res) {
	// yes
	util.inspect(res);

}, function(err) {
	// no
});
````

TSD uses Promise/A+ by [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io) packages. :point_left::+1: 

### API docs 

:x: Not yet. 

## Build

TSD is written in [TypeScript](http://www.typescriptlang.org/) `0.9.x` and build using [Grunt](http://www.gruntjs.com).

To rebuild clone or fork the repos:

	// install dependencies
	$ npm install

	// build, lint and test
	$ grunt test

	// only rebuild (and run cli)
	$ grunt build

Either install global or use in dev folder:

	// run in dev folder
	$ node ./build/cli.js query d3 --dev

	// install to global cli
	$ npm install . -g

TSD uses [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) to easily test separate test sets during development:
	
	// list aliases
	$ grunt -h

	// for example: run only api tests
	$ grunt gtx:api
	$ grunt gtx:cli
	$ grunt gtx:tsd
	//.. etc

It is recommend you use an intelligent parsing IDE (WebStorm or VisualStudio) and a big screen (or two) on a decent workstation. Code looks best with tabs rendered at 4 spaces (3 is nice too, or 6 or 8, I don't care, because smart-tabs are awesome like that). 

### Awesome tech used

* [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io) - promises as promised.
* [grunt-ts](https://github.com/basarat/grunt-ts) - TypeScript compiler for grunt.
* [tslint](https://github.com/palantir/tslint) + [grunt-tslint](https://github.com/palantir/grunttslint) - TypeScript linter (note: if you are bored then help them making rules!)
* [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) - Gruntfile powerbooster (disclosure: my own module).
* [tv4](https://github.com/geraintluff/tv4) - JSON-Schema validation like a boss.
* [node-exit](https://github.com/cowboy/node-exit) - (@cowboy and the grunt team pick up where node.js is [dropped the ball](https://github.com/joyent/node/issues/3584)).
* And many others.

## Contribute

Contributions will be welcome once the application architecture stabilises a bit more. If you want to fix some isolated thing in the development version then that is already appreciated, but please discuss a [ticket](https://github.com/DefinitelyTyped/tsd/issues) or risk the basis of your work being re-factored. 

## History

### v0.5.x ( > 2013-08)

* `0.5.0` - `current` - Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

### v0.3.x

* Original version by @[Diullei ](https://github.com/Diullei).

To install `v0.3.x` use:

	$ npm install tsd@0.3.0 -g

## License

Copyright (c) 2013 by Bart van der Schoor

Licensed under the [Apache License, Version 2.0](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/LICENSE.txt). 

(there is some imported MIT licensed code by myself, Bart van der Schoor, but I grant myself perpetual licence of my own work)

Copyright (c) 2012 by Diullei Gomes

Licensed under the MIT License. 