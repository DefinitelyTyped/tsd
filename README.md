# TSD

[![Build Status](https://secure.travis-ci.org/DefinitelyTyped/tsd.png?branch=develop-0.5.x)](http://travis-ci.org/DefinitelyTyped/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd) [![Dependency Status](https://david-dm.org/DefinitelyTyped/tsd.png)](https://david-dm.org/DefinitelyTyped/tsd) [![devDependency Status](https://david-dm.org/DefinitelyTyped/tsd/dev-status.png)](https://david-dm.org/DefinitelyTyped/tsd#info=devDependencies)

> TypeScript Definition package manager for DefinitelyTyped

TSD is a package manager to install [TypeScript](http://www.typescriptlang.org/) definition files directly from the community driven [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repository. 

:bangbang: Version `0.5.x` not backwards compatible with the config files from earlier versions (as the data source changed so much).

### 0.5.x Preview notes :warning: 

*	Version `0.5.x` is functional and usable but still in development:
	*	If you decide to use it be sure to update regularly.
	*	There will be bugs and quirks. We do out best to remove the bugs.
*	It is recommended you check-in the definitions you install into your VCS:	*	
	*	The `tsd.json` file saves [repo + commit + path] so usually we can find the file but you might want to make local changes.
	*	Don't forget to push your fixes back to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) (maybe one day TSD will help you with this).
*	API and options are not 100% final.

#### Rate limit

The Github API has a 60 requests-per-hour [rate-limit](http://developer.github.com/v3/#rate-limiting) for non-authenticated use. You'll likely never hit this as TSD uses heavy local and http caching and the definition files are downloaded over no-limited Github RAW urls. 

Unless you do something silly like `$ tsd query * --history --limit 1000 --cacheMode forceRemote`. We are looking into a fallbacks and alternatives to bypass the occasional burst mode.

## Usage as CLI command

:x: Not yet on npm. ~~Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/):~~

	$ npm install tsd -g

:rocket: For preview check the [release tags](https://github.com/DefinitelyTyped/tsd/releases).

	$ npm install git://github.com/DefinitelyTyped/tsd#{{pick-a-tag}} -g

:wrench: If you really must you can install directly from github (only if you feel particularly adventurous):

	$ npm install git://github.com/DefinitelyTyped/tsd#develop-0.5.x -g

:ghost: If you need to install the legacy `v0.3.x` (old readme [here](https://github.com/DefinitelyTyped/tsd/blob/bbbbdde7bfdf3efecd22c848fb318b2435f7dd48/README.md)):

	$ npm install tsd@0.3.0 -g

#### Call CLI

Global `tsd` binary:

	$ tsd

:wrench: For development from a local install/checkout:

	$ node ./build/cli.js

#### Practical examples

Minimal search for 'bootstrap'
		
	$ tsd query bootstrap
	
Install 'bootstrap' definitions:

	$ tsd query bootstrap --action install
	$ tsd query bootstrap -a install

Get some info
		
	$ tsd query bootstrap --info --history --resolve
	$ tsd query bootstrap -i -h -r

Solve the reference to 'jquery', overwrite existing files and save to the tsd.config

	$ tsd query bootstrap --resolve --overwrite --save --action install
	$ tsd query bootstrap -r -o -s -a install

Search for jquery plugins:
		
	$ tsd query */jquery.*

### Selector explained

TSD uses a (globbing) path + filename selector to query the DefinitelyTyped index:

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

## FAQ & Info

### What is the location of the cache folders?

The cache is stored in the users home directory (like `$ npm` does). Use `$ tsd settings` to view the current path. Use the `--cacheDir` to overide, or `--cacheMode` to modify caching behaviour. 

### Why does the install / search command not work like in TSD 0.3.0?

The old TSD `v0.3.0` had it's own repository data file that mapped module names to urls of definition files. This had a few downsides for (maintenance being one). Since `v0.5.0` we link directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) where the directory and file names are a reasonable indicator but not 100% identical to the names as you'd find them in npm, bower or other package managers.

The DefinitelyTyped group is working on a meta-data source that will solve this.

### Can TSD install the definitions for the correct module version or fork?

Yes, and no. 

There is basic support for parsing semver-postfixes from the definition file names, and you can filter on this using [semver](https://github.com/isaacs/node-semver) ranges with the `--version` option: Try it with the 'node' definitions.

It works well but is not used a lot in the current DefinitelyTyped repository, because of some issues in other toolings. The DefinitelyTyped group is working on a meta-data source that will solve this (the [Nuget exporter](https://github.com/DefinitelyTyped/NugetAutomation) is waiting for this too).

### I have a suggestion or idea

Feel free to leave a [ticket](https://github.com/DefinitelyTyped/tsd/issues). Questions and contributions for the definition files go [here](https://github.com/borisyankov/DefinitelyTyped/issues).

### Do you have a grunt task to automate some TSD tasks?

Of course! We are developing [grunt-tsd](https://github.com/DefinitelyTyped/grunt-tsd).

### What is all this non-tsd stuff in `./src` and `./lib`?

Author @Bartvds is incubating some modules and helpers there. Some of these will be moved to their own packages at some point. 

### What are the docs?

* More about [code](CODE.md).
* Some extra [info](INFO.md).
* Things [todo](TODO.md).

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

TSD uses [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) to test separate test suites sets during development:
	
	// list aliases
	$ grunt -h

	// for example: run only api tests
	$ grunt gtx:api
	$ grunt gtx:cli
	$ grunt gtx:tsd
	//.. etc

It is recommend you use an intelligent parsing IDE (WebStorm or VisualStudio) and a big screen (or two) on a decent workstation. Code looks best with tabs rendered at 4 spaces (3 is really nice too, or 6 or 8, I don't care, because smart-tabs are awesome like that). 

## Contribute

Contributions will be welcome once the application architecture stabilises a bit more. If you want to fix some isolated thing in the development version then that is already appreciated, but please discuss a [ticket](https://github.com/DefinitelyTyped/tsd/issues) (or risk the basis of your work being re-factored). 

**Note:** TSD no longer maintains it's own data sources, contributions on definitions files go directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

## Notable modules

Shout-out to essential modules used to build TSD:

* [grunt-ts](https://github.com/basarat/grunt-ts) - TypeScript compiler for grunt.
* [tslint](https://github.com/palantir/tslint) + [grunt-tslint](https://github.com/palantir/grunttslint) - TypeScript linter (note: if you are bored then help make new rules!)
* [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) - Gruntfile powerbooster (by author).
* [tv4](https://github.com/geraintluff/tv4) - JSON-Schema validation like a boss.
* [q](https://github.com/kriskowal/q) and [q-io](https://github.com/kriskowal/q-io) - Promises as promised.
* [node-exit](https://github.com/cowboy/node-exit) - (@cowboy and the grunt team pick up where node.js has [dropped the ball](https://github.com/joyent/node/issues/3584)).
* [semver](https://github.com/isaacs/node-semver) - Semver parsing and filtering

## History

### v0.5.x ( > 2013-08)

* `0.5.x` - `current` - Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

### v0.3.x

* Original version by @[Diullei](https://github.com/Diullei).

To install `v0.3.x` use:

	$ npm install tsd@0.3.0 -g

## License

Copyright (c) 2013 by Bart van der Schoor

Licensed under the [Apache License, Version 2.0](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/LICENSE.txt). 

* note: there is some imported MIT licensed code by myself, [Bart van der Schoor](https://github.com/Bartvds), but I grant myself perpetual licence of my own work)

Copyright (c) 2012 by [Diullei Gomes](https://github.com/Diullei).

Licensed under the MIT License. 

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/DefinitelyTyped/tsd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")