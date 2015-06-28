# TSD

[![Build Status](https://travis-ci.org/DefinitelyTyped/tsd.svg?branch=master)](https://travis-ci.org/DefinitelyTyped/tsd) [![Build status](https://ci.appveyor.com/api/projects/status/v4w7p3qvcuxhte33/branch/master?svg=true)](https://ci.appveyor.com/project/Diullei/tsd/branch/master) [![NPM version](https://badge.fury.io/js/tsd.svg)](http://badge.fury.io/js/tsd) [![Dependency Status](https://david-dm.org/DefinitelyTyped/tsd.svg)](https://david-dm.org/DefinitelyTyped/tsd) [![devDependency Status](https://david-dm.org/DefinitelyTyped/tsd/dev-status.svg)](https://david-dm.org/DefinitelyTyped/tsd#info=devDependencies)

> TypeScript Definition manager for DefinitelyTyped

TSD is a package manager to search and install [TypeScript](http://www.typescriptlang.org/) definition files directly from the community driven [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) repository.


## Install

Install global using [node](http://nodejs.org/) using [npm](https://npmjs.org/).:

````bash
npm install tsd -g
````

For previews and history check the [release tags](https://github.com/DefinitelyTyped/tsd/releases).

## Commands

### Quick start

````bash
$ tsd install jquery --save

$ tsd query angular -ir
$ tsd query angularjs/

$ tsd query jquery.*
# glob on mac/linux
$ tsd query "jquery.*"

#install all definitions from tsd.json
$ tsd install
````

### Commands

Global `tsd` binary with help.

````bash
$ tsd
$ tsd -h
$ tsd --help
$ tsd --version
````

[![$ tsd -h](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help-small.png)](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help.png)

Sometimes it looks like this:

* [`$ tsd --help`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/help.png)
* [`$ tsd query async --info --history --action install`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/async.png)
* [`$ tsd query angular* --resolve`](https://raw.github.com/DefinitelyTyped/tsd/master/media/capture/angular.png)


### Init

Create a new `tsd.json` and `tsd.d.ts`. This is not required but useful to init valid project references before starting to add (external) code, or if you want to edit the config.

````bash
$ tsd init
````


#### Search

Minimal query for `d3`:

````bash
$ tsd query d3
````

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

Hint: if you are using Linux or Mac OS X, use quotes to glob:

````bash
$ tsd query "*/jquery.*"
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

Note: more info on queries can be found futher-on in this readme.

#### Open a browser

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

Install `mocha`:

````bash
$ tsd install mocha
````

Install `mocha` and save to `tsd.json`:

````bash
$ tsd install mocha --save
$ tsd install mocha -s
````

Same as query action:
````bash
$ tsd query mocha --save --action install
$ tsd query mocha -sa install
````


Resolve the reference to `jquery`, overwrite existing files and save to `tsd.json`:

````bash
$ tsd install angular --resolve --overwrite --save
$ tsd install angular -r -o -s
$ tsd install angular -ros
````

Same as query action:
````bash
$ tsd query angular --resolve --overwrite --save --action install
````

Install `mocha`, `chai` and `sinon` definitions all at once, with resolve references, overwrite existing files and save to `tsd.json`:

````bash
$ tsd install mocha chai sinon -ros
````

Install all definitions from `tsd.json`:

````bash
$ tsd install
````

> NOTE: `tsd install` will work like `tsd reinstall --save --overwrite`

#### Reinstall definitions

Reset the definitions to the commits listed in `tsd.json`:

````bash
$ tsd reinstall --save --overwrite
$ tsd reinstall -s -o
$ tsd reinstall -so
````


#### Update all definitions

Update everything in `tsd.json` to head version in the repository:

````bash
$ tsd update --save --overwrite
$ tsd update -s -o
$ tsd update -so
````


#### Link to bundled definitions

TSD supports discovery and linking of definitions from packages installed with `node` or `bower`.

Use the `link` command and your `tsd.d.ts` will be updated with paths to the files in the `node_modules` or `bower_modules` folders.


````bash
$ tsd link
````

This feature will scan `package.json` and `bower.json` files for a `typescript` element. This element then contains `definition` or `definitions` sub-element that contain relative path(s) to `.d.ts` files:


````json
{
	"name": "cool-module",
	"version": "1.2.3",
	"typescript": {
		"definition": "dist/cool-module.d.ts"
	}
}
````

If the module exports multiple independent files,eg: for some reason not internally `<reference>`'d:

````json
{
	"name": "cool-module",
	"version": "1.2.3",
	"typescript": {
		"definitions": [
			"dist/cool-partA.d.ts",
			"dist/cool-partB.d.ts"
		]
	}
}
````


#### Rebundle definition file

Cleanup the bundle file (usually `tsd.d.ts`): remove paths to non-existent files, and append unlisted definitions. Handy when editing definitions.

````bash
$ tsd rebundle
````


#### Rate-limit

Print current Github rate-limit info

````bash
$ tsd rate
````


#### Clear http cache

Forcefully remove global http cache files

````bash
$ tsd purge
````


## Detailed queries

There are various ways to select files from the repository index.

### Module name

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

Or simply get everything in a project:

````bash
$ tsd query project/
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

Hint: if you are using Linux or Mac OS X, use quotes to glob:

````bash
$ tsd query "*/jquery.*"
````

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
$ tsd query youtube --commit d6ff

$ tsd query youtube -y
$ tsd query youtube -c d6ff
````

Notes:

1. For now this only works with commits that actually changed the definition file you selected (eg, listed in `--history`) This will be expanded to allow selecting from any commit at a later date.

## Special files

### tsd.json

The `tsd.json` file is automatically created in the root of each project: it configures TSD and it tracks the definitions that are installed (using `--save`).

To generate a default `tsd.json` run:

````bash
$ tsd init
````

An example configuration the 'node.js' definition installed would look like this:

````json
{
	"version": "v4",
	"repo": "borisyankov/DefinitelyTyped",
	"ref": "master",
	"path": "typings",
	"bundle": "typings/tsd.d.ts",
	"installed": {
		"node/node.d.ts": {
			"commit": "6834f97fb33561a3ad40695084da2b660efaee29"
		}
    }
}
````

Supported fields:


| field | required | default | description  |
|---|---|---|---|
| `version` | yes | `v4` | Tracks config version for future changes (don't change this).
| `repo` | yes | `borisyankov/DefinitelyTyped` |  Github user and repo name of the typings repository. Change this if you want to use TSD from a DefinitelyTyped fork.
| `ref` | yes | `master` | Branch name or other git reference of the repository. Change this to use legacy branches.
| `path` | yes | `typings` | Path to the typings directory, the definitions will be installed in the appropriate sub-folders. Change this to have typings in your main code directory, but this is not recommended as the mixed styles used in the definitions it will confuse your inspections and lint-tools.
| `bundle` | no | `typings/tsd.d.ts` | Path to a `.d.ts` bundle file (see below). Change this if you want the bundle to be closer to the actual source files. TSD will create the appropriate relative paths.
| `stats` | no | (not set) | Set to `false` to disable the stats tracking. Keep in mind the stats are anonymous, help us improve TSD & DT and motivate us to spend our time on development. See below for the 'Privacy statement'.

--

### tsd.d.ts

The `tsd.d.ts` file refers every definition that is installed with `--save` for convenient and explicit single reference from code.

````
/// <reference path="../typings/tsd.d.ts" />
````

By default it is created in the typings folder but the name and location are configurable in `tsd.json`. When adding new references TSD will check the existing references and respects re-ordering (ordering is important for inter-dependent definitions).


--

### .tsdrc

This is a optional JSON encoded file to define global settings. TSD looks for it in the  user's home director (eg: `%USERPROFILE%` on Windows, `$HOME` / `~` on Linux), and in the current working directory.

- "**proxy**" - Use a http `proxy`

Any standard http-proxy as supported by the [request](https://github.com/mikeal/request) package.

````json
{
	"proxy": "http://proxy.example.com:88"
}
````

- "**strictSSL**" - Toggle strictSSL verification:

Enabled by default, setting this option to `false` disables strict SSL. Passed to [request](https://github.com/mikeal/request) package.

Useful behind (corporate) proxies that act like man-in-the middle on https connections.

````json
{
	"strictSSL": false
}
````

- "**token**" - Github OAuth token:

The OAuth token can be used to boost the Github API rate-limit from 60 to 5000 (non-cached) requests per hour. The is token needs just ['read-only access to public information'](http://developer.github.com/v3/oauth/#scopes) so no additional OAuth scopes are necessary.

````json
{
	"token": "0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33"
}
````

You can also set the token using the `TSD_GITHUB_TOKEN` environment variable.

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

The bare 'no scope' token is *relatively* harmless as it gives 'read-only access to public information', same as any non-authenticated access. But it does *identify* any requests done with it as being *yours*, so it is still *your* responsibility to keep the token private.

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

TSD uses Promise/A+ by [bluebird](https://github.com/petkaantonov/bluebird). :point_left::+1:

API export is somewhat experimental; take care to lock versions and test on upgrade. If you plan to use TSD as module in a tool or project then feel free to [leave a message](https://github.com/DefinitelyTyped/tsd/issues) and coordinate stuff.

### API docs

Not yet.

## Notes

*	It is recommended you check-in the definitions you install into your VCS.
*	Don't forget to move your fixes back to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped)

#### Github rate-limit

The Github API has a 60-requests-per-hour [rate-limit](http://developer.github.com/v3/#rate-limiting) for non-authenticated use. You'll likely never hit this as TSD uses local caching and the definition files are downloaded from Github RAW urls. If you need some more then a scope-limited Github OAuth token can be used to boost the limit to 5000.

#### Usage stats & update-notifier

The CLI tool [tracks](https://github.com/DefinitelyTyped/tsd/blob/master/src/tsd/cli/tracker.ts) some *anonymous* usage statistics about what definitions are installed though TSD in Google Analytics (using [universal-analytics](https://npmjs.org/package/universal-analytics)). There is also a [update-notifier](https://npmjs.org/package/update-notifier) service to check for TSD updates.


## FAQ & Info

### Is there a build task available?

Of course! The official plugin is [grunt-tsd](https://github.com/DefinitelyTyped/grunt-tsd), and the community created [gulp-tsd](https://github.com/moznion/gulp-tsd).

### I hit the Github rate-limit, now what?

If TSD is used in a way that needs many unique API calls in a short period (like using `--history` on big selections), or shares an internet-connection with multiple users (like in an office) then the rate limit blocks the API. It blocks for 60 minutes after the *first* request of the total 60.

For these cases TSD has an option to use a Github OAuth token and raise your local rate-limit from 60 to 5000 per hour. See the `.tsdrc`-section elsewhere in the readme.

### Does TSD work behind a (corporate) http proxy?

As of `v0.5.7` there are two ways to configure the location of the proxy server:

1. Use a environment variable. TSD support the conventional fields: pick one of `HTTPS_PROXY`, `https_proxy`, `HTTP_PROXY` or `http_proxy`.
1. Use a global `.tsdrc` file and set a `proxy` value (see the tsdrc-section elsewhere in the readme).

### What if my proxy terminates SSL?

As of `v0.6.0` strict SSL verification can be disabled in `.tsdrc` via `strictSSL` variable (see tsdrc-section).

### Can TSD auto-install definitions for a specific package version?

Yes, and no (and later yes again)

There is basic support for parsing semver-postfixes from the definition file names, and you can filter on this using [semver](https://github.com/isaacs/node-semver) ranges with the `--version` option: Try it with the 'node' definitions.

It works well but is not used much in the current DefinitelyTyped repository. The DefinitelyTyped [group](https://github.com/DefinitelyTyped/tsd/issues) is working on a meta-data source that will solve this (the [Nuget exporter](https://github.com/DefinitelyTyped/NugetAutomation) is waiting for this too).

### What is the location of the cache folders?

The cache is stored in the users home directory (like `$ npm`). Use `$ tsd settings` to view the current paths. Use the `--cacheDir` to override the cache directory, or `--cacheMode` to modify caching behaviour.

### I have a suggestion or contribution

Feel free to leave a [ticket](https://github.com/DefinitelyTyped/tsd/issues). Questions and contributions for the definition files go [here](https://github.com/borisyankov/DefinitelyTyped/issues).

## History

### v0.6.x ( > 2014-10)

* Long delayed release of major overhaul: migrated code to external module style and reworked many features, subsystems and dependencies. Development in [dev/next](https://github.com/DefinitelyTyped/tsd/tree/dev/next) branch.

* Interesting changes
	* added `install` command to CLI
	* improved module-name pattern matching
	* refreshed CLI interface, formatting, help
	* reworked http download/cache
	* switched many modules, added `definition-header`
	* replaced ugly node-gyp sub-dependency

### v0.5.x ( > 2013-08)

* Current release versions. See the [release tags](https://github.com/DefinitelyTyped/tsd/releases) fore more details.

* Full rewrite by @[Bartvds](https://github.com/Bartvds): drops the separated TSD data registry in favour of using the [Github API](http://developer.github.com/) to pull definitions directly from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).

### v0.3.x

* Original version by @[Diullei](https://github.com/Diullei).

To install `v0.3.x` (old readme [here](https://github.com/DefinitelyTyped/tsd/blob/legacy/README.md)):

````bash
$ npm install tsd@0.3.0 -g
````

## Build

TSD is compiled with [TypeScript](http://www.typescriptlang.org/) `v1.1.0-1` and managed using [Grunt](http://www.gruntjs.com).

To rebuild clone the repos:

Install dependencies:

````bash
$ npm install
````

Build, lint and test:

````bash
$ grunt test
````

Only rebuild:

````bash
$ grunt build
````

Run in dev folder:

````bash
$ node ./build/cli.js query d3 --dev
````

Install dev folder to global cli:

````bash
$ npm install . -g
````

TSD uses [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx) to test separate test suites sets during development:

List aliases:

````bash
$ grunt -h
````

Example: run only api tests:

````bash
$ grunt gtx:api
$ grunt gtx:cli
$ grunt gtx:tsd
````

It is recommend you use an intelligent parsing IDE (WebStorm or VisualStudio) and a big screen (or two) on a properly powerful workstation.

Code looks best with tabs rendered at 4 spaces (3 is nice too, or 6 or 8.. I don't really care, because [smart-tabs](http://www.emacswiki.org/SmartTabs) are awesome like that). The gruntfile uses slightly harsh [JSHint](https://github.com/jshint/jshint) and [TSLint](https://github.com/palantir/tslint) settings to enforce code style, but there is an [`.editorconfig`](http://editorconfig.org/) to elevate some of the pain.

Master branch is the release version, new development happens currently in [dev/next](https://github.com/DefinitelyTyped/tsd/tree/dev/next) branch: probably broken and regularly rebased for near future.


## Contribute

Contributions are very welcome; please discuss larger changes in a [ticket](https://github.com/DefinitelyTyped/tsd/issues) first. Fixes and simple enhancements are always much appreciated. Please make sure you work in the right branch.

**Note:** Contributions on the definition files go directly to [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped).


## Privacy

The TSD CLI tool collects definition usage information, like the queries made to the repo and the definitions that get installed. The information collected amounts to about same level of detail as services like npm or github would collect (maybe even less as we don't track a user id).

The API does not track anything.

To store this TSD uses [Google Analytics](http://www.google.com/analytics/) in the excellent [universal-analytics](https://npmjs.org/package/universal-analytics) package. We might at some point publish some anonymised aggregate stats to the DefinitelyTyped website.

Changes to the policy should be announced in release notes, and ideally ask confirmation on the first CLI use.

Keep in mind we're just devs like you and are working on this in our spare time; we run this project out of love and duty and most of all for fun as learning experience. The stats give us helpful insights into the usage of TSD, and of course the growing numbers and graphs motivate us to spend our time on further development.


## Security

Please close read the relevant sections of the readme, especially on OAuth 'scope'.

The optional [Github OAuth token](http://developer.github.com/v3/oauth/) is only used to authenticate with the Github API. The token is not stored anywhere but the local machine. It is your responsibility to keep your token safe.

Using an OAuth token with additional scope is *neither advised nor supported*, even though it could make TSD work with private repositories. But it might also leak repo or content names to analytics or leave a bare http cache in your temp dir. If this bothers you please review the license and/or leave a message.


## License

Copyright (c) 2014 by [Bart van der Schoor](https://github.com/Bartvds) @ [DefinitelyTyped](https://github.com/DefinitelyTyped)

Licensed under the [Apache License, Version 2.0](https://raw.github.com/DefinitelyTyped/tsd/master/LICENSE.txt).

* note: there is some imported MIT licensed code by myself, [Bart van der Schoor](https://github.com/Bartvds)

Copyright (c) 2012 by [Diullei Gomes](https://github.com/Diullei).

Licensed under the MIT License.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/DefinitelyTyped/tsd/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
