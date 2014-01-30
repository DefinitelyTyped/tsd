# TSD

[![Build Status](https://secure.travis-ci.org/DefinitelyTyped/tsd.png?branch=develop-0.5.x)](http://travis-ci.org/DefinitelyTyped/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd) [![Dependency Status](https://david-dm.org/DefinitelyTyped/tsd.png)](https://david-dm.org/DefinitelyTyped/tsd) [![devDependency Status](https://david-dm.org/DefinitelyTyped/tsd/dev-status.png)](https://david-dm.org/DefinitelyTyped/tsd#info=devDependencies)

> TypeScript Definition manager for DefinitelyTyped

TSD is a package manager to install [TypeScript](http://www.typescriptlang.org/) definition files directly from the community driven [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repository. 

#### 0.5.x Preview notes :warning: 

*	It is recommended you check-in the definitions you install into your VCS:
	*	The `tsd.json` file saves [repo + commit + path] but you might want to make local changes.
	*	Don't forget to move your fixes back to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped)
*	Not backwards compatible with the config files from earlier versions.
*	Version `0.5.x` still in development; API and options are work-in-progress.
*	See below for legacy version.

#### Github rate-limit

The Github API has a 60 requests-per-hour [rate-limit](http://developer.github.com/v3/#rate-limiting) for non-authenticated use. You'll likely never hit this as TSD uses heavy local and http caching and the definition files are downloaded over unlimited Github RAW urls. We are looking into a fallback to bypass the occasional burst mode.

#### Usage stats & update-check

The CLI tool tracks some *anonymous* usage statistics about what definitions are installed though TSD in Google Analytics (using [universal-analytics](https://npmjs.org/package/universal-analytics)). There is also a [update-notifier](https://npmjs.org/package/update-notifier) service to check for TSD updates. Both are enabled by default: use the `--services no` option to suppress. A future update will bring some improved controls over this.

## Install

:x: Not yet on npm. ~~Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/):~~

	$ npm install tsd -g

:rocket: For preview check the [release tags](https://github.com/DefinitelyTyped/tsd/releases).

	$ npm install git://github.com/DefinitelyTyped/tsd#{{pick-a-tag}} -g

:wrench: If you really must you can install directly from github (only if you feel particularly adventurous):

	$ npm install git://github.com/DefinitelyTyped/tsd#develop-0.5.x -g

:ghost: If you need to install the legacy `v0.3.x` (old readme [here](https://github.com/DefinitelyTyped/tsd/blob/bbbbdde7bfdf3efecd22c848fb318b2435f7dd48/README.md)):

	$ npm install tsd@0.3.0 -g

## Usage as CLI command

Global `tsd` binary:

	$ tsd

:wrench: For development from a local install/checkout:

	$ node ./build/cli.js

It looks like this:

* [`$ tsd --help`](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/media/capture/help.png)
* [`$ tsd query async --info --history --install`](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/media/capture/async.png)
* [`$ tsd query angular* --resolve`](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/media/capture/angular.png)


### Help

	$ tsd -h

[![$ tsd -h](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/media/capture/help-small.png)](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/media/capture/help.png)

### Practical examples

Minimal query for 'd3':
		
	$ tsd query d3

List *everything*:
		
	$ tsd query *

Get some info about 'jquery':
		
	$ tsd query jquery --info --history --resolve
	$ tsd query jquery -i -h -r
	
Install 'bootstrap' definitions:

	$ tsd query bootstrap --action install
	$ tsd query bootstrap -a install

Solve the reference to 'jquery', overwrite existing files and save to the tsd.config:

	$ tsd query angular --resolve --overwrite --save --action install
	$ tsd query angular -r -o -s -a install

Search for jquery plugins:
		
	$ tsd query */jquery.*

Install and save to 'test.d.ts' `<reference/>` bundle:
		
	$ tsd query mocha chai -a install -r -o -s -b test

Open 'pixi' in your browser on github:
		
	$ tsd query pixi -a browse

### Selectors

TSD uses a (globbing) path + filename selector to query the DefinitelyTyped index, where the definition name takes priority:

	$ tsd query module
	$ tsd query project/module

Consider these definitions:
	
	project/module.d.ts
	project/module-0.1.2.d.ts
	project/module-addon.d.ts

	project-plugin/plugin.d.ts

	other/module.d.ts
	other/plugin.d.ts

Notice the pattern, and ignore the `.d.ts` extension:

	<project>/<module><semver>.d.ts	

Select definitions using only the module name:

	$ tsd query module
	$ tsd query module-addon

Or use a selector derived from the path format:

	$ tsd query project/module
	$ tsd query other/module

### Globbing filter

The selector also supports globbing, for example:

	$ tsd query project/*
	$ tsd query project*
	$ tsd query module*
	$ tsd query project/module*
	$ tsd query project-*/plugin*
	$ tsd query *project*/*
	$ tsd query project/plugin*
	$ tsd query other/module
	$ tsd query */module
	$ tsd query */module-*
	$ tsd query */*plugin

:bangbang: Globbing implements only leading and trailing (for now).

### Semver filter

Note: the [semver](https://github.com/isaacs/node-semver) postfix of definition files is expected to be separated by a dash and possibly a `'v'`

	module-0.1.2
	module-v0.1.2
	module-v0.1.2-alpha

If there are multiple matches with same module name they will be prioritised:

1.	The unversioned name is considered being most recent.
2.	Then versions are compared as expected following these [comparison](https://github.com/isaacs/node-semver#comparison) rules.
3.	Use the `--version` / `-v` option to set a semver-range:

````
$ tsd query node -v latest
$ tsd query node -v all
$ tsd query node -v ">=0.8 <0.10"
$ tsd query node -v "<0.10"
````

### Date filter

Use the `--date` / `-d` option to set a date-range (find dates using `--history`):

````
$ tsd query d3 --history
$ tsd query d3 --date ">=2012-01-01"
$ tsd query d3 --date "<2012-01-01"
````

### Commit filter

Use the `--commit` / `-c` option to supply sha1-hash of a commit (find a commit hash using `--history`), 
for convenience a shortened sha1 hash is supported. 

````
$ tsd query youtube --history
$ tsd query youtube --commit d6ff
````

Notes:

1. For now this only works with commits that actually changed the definition file you selected (eg, from `--history`) This will be expanded to allow selecting from any commit at a later date.

## Usage as module

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

### Why does the install / search command not work like in TSD 0.3.0?

The old TSD `v0.3.0` had it's own repository data file that mapped module names to url's of definition files. This had a few downsides for (maintenance being one). Since `v0.5.0` we link directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) where the directory and file names are a reasonable indicator but not 100% identical to the names as you'd find them in npm, bower or other package managers.

The DefinitelyTyped [group](https://github.com/DefinitelyTyped/tsd/issues) is working on a meta-data source that will solve this.

### Can TSD install the definitions for the correct module version or fork?

Yes, and no (and later yes again) 

There is basic support for parsing semver-postfixes from the definition file names, and you can filter on this using [semver](https://github.com/isaacs/node-semver) ranges with the `--version` option: Try it with the 'node' definitions.

It works well but is not used much in the current DefinitelyTyped repository. The DefinitelyTyped [group](https://github.com/DefinitelyTyped/tsd/issues) is working on a meta-data source that will solve this (the [Nuget exporter](https://github.com/DefinitelyTyped/NugetAutomation) is waiting for this too).

### What is the location of the cache folders?

The cache is stored in the users home directory (like `$ npm`). Use `$ tsd settings` to view the current paths. Use the `--cacheDir` to override the cache directory, or `--cacheMode` to modify caching behaviour. 

### Do you have a grunt task to automate some TSD tasks?

Of course! The official plugin is aptly named [grunt-tsd](https://github.com/DefinitelyTyped/grunt-tsd).

### Where do you keep background and work docs?

* Some more about the [code](CODE.md).
* Extra background [info](INFO.md) about the conceptual choices (old).
* Internal list of things [todo](TODO.md).

### I have a suggestion or contribution

Feel free to leave a [ticket](https://github.com/DefinitelyTyped/tsd/issues). Questions and contributions for the definition files go [here](https://github.com/borisyankov/DefinitelyTyped/issues).

## History

### v0.5.x ( > 2013-08)

* `0.5.x` - `current` - Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

### v0.3.x

* Original version by @[Diullei](https://github.com/Diullei).

To install `v0.3.x` (old readme [here](https://github.com/DefinitelyTyped/tsd/blob/bbbbdde7bfdf3efecd22c848fb318b2435f7dd48/README.md)):

	$ npm install tsd@0.3.0 -g


## Notable modules

Some essential modules used to build TSD:

* [es6-shim](https://github.com/paulmillr/es6-shim) & [weak-map](https://github.com/drses/weak-map) - Map, Sets and some usefull things.
* [grunt-ts](https://github.com/basarat/grunt-ts) - TypeScript compiler for grunt.
* [tslint](https://github.com/palantir/tslint) + [grunt-tslint](https://github.com/palantir/grunttslint) - TypeScript linter (contribute some rules!)
* [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) - Gruntfile powerbooster (by author).
* [tv4](https://github.com/geraintluff/tv4) - JSON-Schema validation like a boss.
* [q](https://github.com/kriskowal/q) and [q-io](https://github.com/kriskowal/q-io) - Promises as promised.
* [semver](https://github.com/isaacs/node-semver) - Semver parsing and filtering

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

It is recommend you use an intelligent parsing IDE (WebStorm or VisualStudio) and a big screen (or two) on a properly powerful workstation.

Code looks best with tabs rendered at 4 spaces (3 is nice too, or 6 or 8.. I don't really care, because [smart-tabs](http://www.emacswiki.org/SmartTabs) are awesome like that). The gruntfile uses slightly harsh [JSHint](https://github.com/jshint/jshint) and [TSLint](https://github.com/palantir/tslint) settings to enforce code style, but there is an [`.editorconfig`](http://editorconfig.org/) to elevate some of the pain.

## Contribute

Contributions will be welcome once the application architecture stabilises a bit more. If you want to fix some isolated thing in the development version then that is already appreciated, but please discuss in a [ticket](https://github.com/DefinitelyTyped/tsd/issues) first (or risk the basis of your work being re-factored). 

**Note:** TSD no longer maintains it's own data sources, contributions on definitions files go directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

## Privacy statement

The TSD CLI tool collects definition usage information, like the queries made to the repo and the definitions that get installed from the repos. The information collected amounts to about same level of detail as services like npm or github would collect (even less; as we don't track account id's). The API does not track anything. 

TSD uses [Google Analytics](http://www.google.com/analytics/) by the excellent [universal-analytics](https://npmjs.org/package/universal-analytics) package. We might at some point publish some anonymised aggregate stats to the DefinitelyTyped website.



Changes to the policy should be announced in release notes, and ideally ask confirmation on the first CLI use.

## License

Copyright (c) 2013 by [Bart van der Schoor](https://github.com/Bartvds).

Licensed under the [Apache License, Version 2.0](https://raw.github.com/DefinitelyTyped/tsd/develop-0.5.x/LICENSE.txt). 

* note: there is some imported MIT licensed code by myself, [Bart van der Schoor](https://github.com/Bartvds)

Copyright (c) 2012 by [Diullei Gomes](https://github.com/Diullei).

Licensed under the MIT License. 

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/DefinitelyTyped/tsd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")