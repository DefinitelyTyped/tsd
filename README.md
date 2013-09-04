# TSD

[![Build Status](https://secure.travis-ci.org/Diullei/tsd.png?branch=develop-0.5.x)](http://travis-ci.org/Diullei/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd)

> TypeScript Definition Package Manager


TSD is a [TypeScript](http://www.typescriptlang.org/) definition file package manager. Easily download and install community contributed definition files to use in TypeScript projects from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

:warning: Version `0.5.x` not backwards compatible with the config files from earlier versions.

:bangbang: Version `0.5.x` is an alpha version and not ready for production. 

### How to install

:bangbang: Not yet. ~~TSD is installed using [node](http://nodejs.org/) and [npm](https://npmjs.org/). To install TSD use:~~

    $ npm install tsd -g

### Usage

:bangbang: For now only in development folder (not global)

    $ tsd help

    $ tsd search <selector>
    $ tsd deps <selector>
    $ tsd install <selector>
    $ tsd info <selector>
    $ tsd history <selector>
	$ tsd reinstall
	
### Options

:bangbang: Not yet documented.

### Selector

:bangbang: Currently semver selection is not implemented (a case is the node.js 0.8 definition)

:bangbang: Currently globs implement only leading and trailing.

Consider these definitions:
	
	project/module.d.ts
	project/module-0.1.2.d.ts
	project/module-0.1.2-alpha.d.ts

	project/module-addon.d.ts
	project/module-addon-v0.1.2.d.ts

	<project>/<module><semver>.d.ts	

Select definitions using only the module name:

	module
	module-addon

Or use a selector derived from the path format:

	project
	project/module

The selector also supports globbing:

	project*
	project/*
	module*
	proj*/module-*
	project/*addon

Note: the semver postfix is expected to be separated by a dash and possibly a `'v'`

	module-0.1.2
	module-v0.1.2

If there are multiple files with same module name they will be prioritised:

1.	The unversioned name is considered being most recent.
2.	Then versions are compared as expected following the [comparison](https://github.com/isaacs/node-semver#comparison) rules.


## Change log

### v0.5.0 (2013-08)

* Full rewrite by @Bartvds: drops the separated TSD data registry in favour of using the Github API to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

## License

Copyright (c) 2012 by Diullei Gomes

Licensed under the [MIT license](https://raw.github.com/Diullei/tsd/master/LICENSE.txt).