# TSD

[![Build Status](https://secure.travis-ci.org/DefinitelyTyped/tsd.png?branch=master)](http://travis-ci.org/DefinitelyTyped/tsd) [![NPM version](https://badge.fury.io/js/tsd.png)](http://badge.fury.io/js/tsd) [![Dependency Status](https://david-dm.org/DefinitelyTyped/tsd.png)](https://david-dm.org/DefinitelyTyped/tsd) [![devDependency Status](https://david-dm.org/DefinitelyTyped/tsd/dev-status.png)](https://david-dm.org/DefinitelyTyped/tsd#info=devDependencies)

> TypeScript Definition manager for DefinitelyTyped

TSD is a package manager to search and install [TypeScript](http://www.typescriptlang.org/) definition files directly from the community driven [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repository. 

#### Usage notes

*	It is recommended you check-in the definitions you install into your VCS.
*	Don't forget to move your fixes back to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped)

#### Github rate-limit

The Github API has a 60-requests-per-hour [rate-limit](http://developer.github.com/v3/#rate-limiting) for non-authenticated use. You'll likely never hit this as TSD uses local caching and the definition files are downloaded from Github RAW urls. Optionally a scope-limited Github OAuth token can be used to boost the limit to 5000.

#### Usage stats & update-notifier

The CLI tool [tracks](https://github.com/DefinitelyTyped/tsd/blob/master/src/tsd/cli/tracker.ts) some *anonymous* usage statistics about what definitions are installed though TSD in Google Analytics (using [universal-analytics](https://npmjs.org/package/universal-analytics)). There is also a [update-notifier](https://npmjs.org/package/update-notifier) service to check for TSD updates.

## Install

Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/):

````bash
$ npm install tsd -g
````

For previews and history check the [release tags](https://github.com/DefinitelyTyped/tsd/releases).

## Usage as CLI command

Global `tsd` binary:

````bash
$ tsd -h
````

[![$ tsd -h](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help-small.png)](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help.png)

Sometimes it looks like this:

* [`$ tsd --help`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help.png)
* [`$ tsd query async --info --history --action install`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/async.png)
* [`$ tsd query angular* --resolve`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/angular.png)

### Practical examples

Create a new `tsd.json`:

````bash
$ tsd init
````

#### Search

Minimal query for `d3`:

````bash
$ tsd query d3
````

Tip: if you are using Linux or Mac OS X, use `$ tsd query "*"`.

Get some info about `jquery`:

````bash
$ tsd query jquery --info --resolve
$ tsd query jquery -i -r
$ tsd query jquery -ir
````

Search for `jquery` plugins:

````bash
$ tsd query */jquery.*
````

View `mocha` history:

````bash
$ tsd query mocha --history
$ tsd query mocha -y
````

List *everything*:

````bash
$ tsd query *
````

#### Open browser

Browse `pixi` definition on github:

````bash
$ tsd query pixi --action browse
$ tsd query pixi -a browse
````

Visit `gruntjs` homepage:

````bash
$ tsd query gruntjs --action visit
$ tsd query gruntjs -a visit
````

#### Install to project

Install `mocha`, `chai` and `sinon` definitions all at once:

````bash
$ tsd query mocha chai sinon --action install
$ tsd query mocha chai sinon -a install
````

Install `bootstrap` definitions:

````bash
$ tsd query bootstrap --action install
$ tsd query bootstrap -a install
````

Solve the reference to `jquery`, overwrite existing files and save to the tsd.config:

````bash
$ tsd query angular --resolve --overwrite --save --action install
$ tsd query angular -r -o -s -a install
$ tsd query angular -rosa install
````
Install and save to `test.d.ts` as `<reference/>` bundle:

````bash
$ tsd query mocha chai -r -o -s -a install -b test
````

## Query

TSD uses a (globbing) path + filename selector to query the [DefinitelyTyped index](https://github.com/borisyankov/DefinitelyTyped). The results can then be modified using various filters:

Note how the definition filename takes priority:

````bash
$ tsd query module
$ tsd query project/module
````


For example, consider these definitions:

````
project/module.d.ts
project/module-0.1.2.d.ts
project/module-addon.d.ts

project-plugin/plugin.d.ts

other/module.d.ts
other/plugin.d.ts
````

Notice the pattern, and ignore the `.d.ts` extension:

````html
<project>/<module><semver>.d.ts	
````

Select definitions using only the module name:

````bash
$ tsd query module
$ tsd query module-addon
````

Or use a selector derived from the path format:

````bash
$ tsd query project/module
$ tsd query other/module
````

### Globbing filter

The selector also supports globbing, for example:

````bash
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
````

Globbing implements only leading and trailing (for now).

### Semver filter

Note: the [semver](https://github.com/isaacs/node-semver) postfix of definition files is expected to be separated by a dash and possibly a `'v'`

````
module-0.1.2
module-v0.1.2
module-v0.1.2-alpha
````

If there are multiple matches with same module name they will be prioritised:

1.	The unversioned name is considered being most recent.
2.	Then versions are compared as expected following these [comparison](https://github.com/isaacs/node-semver#comparison) rules.
3.	Use the `--version` / `-v` option to set a semver-range:

````bash
$ tsd query node -v latest
$ tsd query node -v all
$ tsd query node -v ">=0.8 <0.10"
$ tsd query node -v "<0.10"
````

### Date filter

Use the `--date` / `-d` option to set a date-range (find dates using `--history` / `-y`):

````bash
$ tsd query d3 --history
$ tsd query d3 --date ">=2012-01-01"

$ tsd query d3 -y
$ tsd query d3 -d "<2012-01-01"
````

### Commit filter

Use the `--commit` / `-c` option to supply sha1-hash of a commit (find a commit hash using `--history`), for convenience a shortened sha1 hash is supported. 

````bash
$ tsd query youtube --history
$ tsd query youtube --date d6ff

$ tsd query youtube -y
$ tsd query youtube -c d6ff
````

Notes:

1. For now this only works with commits that actually changed the definition file you selected (eg, listed in `--history`) This will be expanded to allow selecting from any commit at a later date.

## Usage as module
 
TSD can be used as a JavaScript npm dependency: 

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

For a practical example see [grunt-tsd](https://github.com/DefinitelyTyped/grunt-tsd).

TSD uses Promise/A+ by [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io) packages. :point_left::+1: 

Note: Keep in mind this project started as a `<reference>` style TypeScript `v0.8.x` single-file compile target, which makes it harder to limit the exported API compared to `import` multi-file style. This is also why the definitions include more then just the `tsd` namespace. 

API export is somewhat experimental; take care to lock versions and test on upgrade. If you plan to use TSD as module in a tool or project then feel free to [leave a message](https://github.com/DefinitelyTyped/tsd/issues) and coordinate stuff.

### API docs 

Not yet. 

## Special files

### tsd.json

The `tsd.json` file is automatically created in the root of each project: it configures TSD and it tracks the definitions that are installed (using `--save`). See the [JSON Schema](https://github.com/DefinitelyTyped/tsd/tree/master/schema) for more info.

### tsd.d.ts

The `tsd.d.ts` file links every definition that is installed (with `--save`) for convenient reference:

````
/// <reference path="../typings/tsd.d.ts" />
```` 

By default it is created in the typings folder but it is configurable in `tsd.json`. TSD will check the existing references and respects re-ordering.

### .tsdrc

This is a optional JSON encoded file to define global settings. TSD looks for it in the  user's home director (eg: `%USERPROFILE%` on Windows, `$HOME` / `~` on Linux), and in the current working directory.

- "**proxy**" - Use a http `proxy`

Any standard http-proxy as supported by the [request](https://github.com/mikeal/request) package.

````json
{
	"proxy": "http://proxy.example.com:88"
}
````

- "**token**" - Github OAuth token:

The OAuth token can be used to boost the Github API rate-limit from 60 to 5000 (non-cached) requests per hour. The is token needs just ['read-only access to public information'](http://developer.github.com/v3/oauth/#scopes) so no additional OAuth scopes are necessary.

````json
{
	"token": "0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
}
````

You can create this token on Github.com:

1. Go to https://github.com/settings/tokens/new
3. *Deselect* all scopes to create a token with just basic authentication.
	1. (verify you *really* deselected all scopes) 
	5. (wonder why these presets were set??)
2. Enter a identifying name, something like "`TSD Turbo 5000`"
5. Create the token.
6. Copy the hex-string to the `token` element in the `.tsdrc` file.
6. Verify enhanced rate-limit using `$ tsd rate`

Change or revoke the token at any time on https://github.com/settings/applications

Note: keep in mind the `.tsdrc` file is *not* secured. Don't use a token with additional scope unless you know what you are doing. 

The bare 'no scope' token is *relatively* harmless as it gives 'read-only access to public information', same as any non-autenticated access. But it does *identify* any requests done with it as being *yours*, so it is still *your* responsibility to keep the token private.

## FAQ & Info

### Is there a grunt task available?

Of course! The official plugin is [grunt-tsd](https://github.com/DefinitelyTyped/grunt-tsd).

### I hit the rate-limit: now what?

If TSD is used in a way that needs many unique API calls in a short period (like using `--history` on big selections), or shares an internet-connection with multiple users (like in an office) then the rate limit blocks the API. It blocks for 60 minutes after the *first* request of the total 60.

For these cases TSD has an option to use a Github OAuth token and raise your local rate-limit from 60 to 5000 per hour. See the `.tsdrc`-section elsewhere in the readme.

### Does TSD work behind a (corporate) http proxy?

As of `v0.5.7` there are two ways to configure the location of the proxy server:

1. Use a environment variable. TSD support the conventional fields: pick one of `HTTPS_PROXY`, `https_proxy`, `HTTP_PROXY` or `http_proxy`.
1. Use a global `.tsdrc` file and set a `proxy` value (see the tsdrc-section elsewhere in the readme).

### Why does the install / search command not work like in TSD 0.3.0?

The old TSD `v0.3.0` had it's own repository data file that mapped module names to url's of definition files. This had a few downsides for (maintenance being one). Since `v0.5.0` we link directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) where the directory and file names are a reasonable indicator but not 100% identical to the names as you'd find them in npm, bower or other package managers.

The DefinitelyTyped [group](https://github.com/DefinitelyTyped/tsd/issues) is working on a meta-data source that will solve this.

### Can TSD auto-install definitions for a specific package version?

Yes, and no (and later yes again)

There is basic support for parsing semver-postfixes from the definition file names, and you can filter on this using [semver](https://github.com/isaacs/node-semver) ranges with the `--version` option: Try it with the 'node' definitions.

It works well but is not used much in the current DefinitelyTyped repository. The DefinitelyTyped [group](https://github.com/DefinitelyTyped/tsd/issues) is working on a meta-data source that will solve this (the [Nuget exporter](https://github.com/DefinitelyTyped/NugetAutomation) is waiting for this too).

### What is the location of the cache folders?

The cache is stored in the users home directory (like `$ npm`). Use `$ tsd settings` to view the current paths. Use the `--cacheDir` to override the cache directory, or `--cacheMode` to modify caching behaviour. 

### I have a suggestion or contribution

Feel free to leave a [ticket](https://github.com/DefinitelyTyped/tsd/issues). Questions and contributions for the definition files go [here](https://github.com/borisyankov/DefinitelyTyped/issues).

## History

### v0.5.x ( > 2013-08)

See the [release tags](https://github.com/DefinitelyTyped/tsd/releases) fore more details.

* `0.5.x` - `current` - Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

### v0.3.x

* Original version by @[Diullei](https://github.com/Diullei).

To install `v0.3.x` (old readme [here](https://github.com/DefinitelyTyped/tsd/blob/legacy/README.md)):

````bash
$ npm install tsd@0.3.0 -g
````

## Notable modules

Some essential modules used to build TSD:

* [es6-shim](https://github.com/paulmillr/es6-shim) & [weak-map](https://github.com/drses/weak-map) - Map, Sets and some usefull things.
* [grunt-ts](https://github.com/basarat/grunt-ts) - TypeScript compiler for grunt.
* [tslint](https://github.com/palantir/tslint) + [grunt-tslint](https://github.com/palantir/grunt-tslint) - TypeScript linter (contribute some rules!)
* [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) - Gruntfile powerbooster (by author).
* [tv4](https://github.com/geraintluff/tv4) - JSON-Schema validation like a boss.
* [q](https://github.com/kriskowal/q) and [q-io](https://github.com/kriskowal/q-io) - Promises as promised.
* [semver](https://github.com/isaacs/node-semver) - Semver parsing and filtering

## Build

TSD is build with [TypeScript](http://www.typescriptlang.org/) `v0.9.7` and managed using [Grunt](http://www.gruntjs.com).

To rebuild clone or fork the repos:

Install dependencies

````bash
$ npm install
````

Build, lint and test

````bash
$ grunt test
````

Only rebuild (and run cli)

````bash
$ grunt build
````

Either install global or use in dev folder:

Run in dev folder

````bash
$ node ./build/cli.js query d3 --dev
````

Install to global cli

````bash
$ npm install . -g
````

TSD uses [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) to test separate test suites sets during development:

List aliases

````bash
$ grunt -h
````

Example: run only api tests

````bash
$ grunt gtx:api
$ grunt gtx:cli
$ grunt gtx:tsd
````

It is recommend you use an intelligent parsing IDE (WebStorm or VisualStudio) and a big screen (or two) on a properly powerful workstation.

Code looks best with tabs rendered at 4 spaces (3 is nice too, or 6 or 8.. I don't really care, because [smart-tabs](http://www.emacswiki.org/SmartTabs) are awesome like that). The gruntfile uses slightly harsh [JSHint](https://github.com/jshint/jshint) and [TSLint](https://github.com/palantir/tslint) settings to enforce code style, but there is an [`.editorconfig`](http://editorconfig.org/) to elevate some of the pain.

## Contribute

Contributions are very welcome; please discuss larger changes in a [ticket](https://github.com/DefinitelyTyped/tsd/issues) first. Fixes and simple enhancements are always much appreciated. 

**Note:** Contributions on the definition files go directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

## Privacy statement

The TSD CLI tool collects definition usage information, like the queries made to the repo and the definitions that get installed. The information collected amounts to about same level of detail as services like npm or github would collect (maybe even less as we don't track a user id). 

The API does not track anything. 

To store this TSD uses [Google Analytics](http://www.google.com/analytics/) in the excellent [universal-analytics](https://npmjs.org/package/universal-analytics) package. We might at some point publish some anonymised aggregate stats to the DefinitelyTyped website.

The optional [Github OAuth token](http://developer.github.com/v3/oauth/) is only used to authenticate with the Github API. The token is not stored anywhere but the local machine. It is your responsibility to keep your token safe. 

Using an OAuth token with additional scope is *not advised nor supported* (even though it could make TSD work with private repositories). But it might also leak repo or content names to analytics or leave a bare http cache in your temp dir. If this bothers you please review the license and/or leave a message.

Changes to the policy should be announced in release notes, and ideally ask confirmation on the first CLI use.

## License

Copyright (c) 2013 by [Bart van der Schoor](https://github.com/Bartvds).

Licensed under the [Apache License, Version 2.0](https://raw.github.com/DefinitelyTyped/tsd/master/LICENSE.txt). 

* note: there is some imported MIT licensed code by myself, [Bart van der Schoor](https://github.com/Bartvds)

Copyright (c) 2012 by [Diullei Gomes](https://github.com/Diullei).

Licensed under the MIT License. 

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/DefinitelyTyped/tsd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
