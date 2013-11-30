# TSD 0.5.x TODO

> Big list of things that should/could be done.

See also:

* Main [readme](../README.md)
* Project [scope](SCOPE.md)
* Some extra [info](INFO.md)
* More about [code](CODE.md)

## Issues

This info might later migrate to the Github Issue tracker.

## Update docs

Always text to edit in the README or ./docs.

## Local changes

Browse the code in `/src` and `/test` for `//TODO` comments,

Or use `$ grunt todos` for an overview. :point_left::+1:

Most of these are file/class/block 'local' changes: easy to fix without conflicts (hardening, re-implement etc). Some are more important then others (but which ones? :smiley_cat:)

## Tests

Never enough.

* :a:   Expand API command testing (cover more commands)
* :a:   Expand CLI tests (cover more commands)
* :m:   Add CLI test setup
* :o:	Add node.js module tests
* :id:	Consider testing JavaScript output instead of TypeScript source (with compiled declarations: so those get checked too).

Working on a way run data tests from fixtures that can be updated easily (otherwise decent coverage is insane to manage) 

* :m:	Run github api+raw caches from fixtures (with easy updates/expansion)
* :m:   Run API tests from fixtures and stored comparison output (with easy updates/expansion)

## Global / multi-file changes:

### Commands

Basics commands

* :m:	Add **help** (show commands) 
* :m:	Add **version** (show version)
* :m:	Add **init** (new json with repo/branch)
* :m:	Add **settings** (show config info)
* :m:	Add **reinstall** (from config)
* :m:	Add **index** (list definition overview) (search * is compacted)
* :id:	Consider unifying local remote selectors

Remote selector commands

* :m:	Add **query** (search definitions)
* :ng:	Add ~~**search** (search definitions)~~ (now `query`)
* :ng:	Add ~~**install** (install definitions)~~ (via `--action install`)
* :ng:	Add ~~**direct** (install from commit sha, or blob)~~ (via `--commit`)
* :ng:	Add ~~**info** (parse file content)~~ (via `--info`)
* :ng:	Add ~~**history** (list commit history)~~ (via `--history`)
* :ng:	Add **details** ~~(detailed commit history)~~ (make part of `--detail` level option)
* :m:	Enhance deps (list dependencies), make recursive and display

Local selector commands

* :x:	Add **local** (search local files)
* :x:	Add **uninstall** (remove local files)
* :x:	Add **compare** (check for updates)
* :x:	Add **update** (apply updates)

Browser commands

* :o:	Add feature to open a browser to see the pages on github? (diffs, comments etc) :zap:
* :o:	Add feature to open a browser at a project's url (from info) :zap:

UIX commands

* :o:	Add auto/scan command (suggest appropriate definitions from package.json/bower.json) (@seanhess: see [codeplex](https://typescript.codeplex.com/discussions/461449) and [TPM](https://github.com/seanhess/TPM))
* :id:	Consider adding reference/bundle command to generate typing collections (save in config)

Cache commands

* :b:	Add purge (or flush)
* :b:	Add dump (see cache content)
* :m:	Add rate (github api rate limit info)

Selector

* :x:	Improve globbing/RegExp (maybe use [minimatch](https://github.com/isaacs/minimatch)?) :zap:
* :m:	Add support for semver
* :m:	Add support for multiple Selectors (blend results in select())
* :x:	Add InfoMatcher to Selector / select() :zap:
* :m:	Add search-by-date ~~to history-command,~~ add as DateMatcher to Selector / select()
* :m:	Add search-by-commit to Selector / select()

Command options

* :m:   Plan options and unify the names (both for CLI as API)
* :m:	Add option for file overwrite (always on now) `--overwrite`
* :b:	Add a compact vs detailed option (for search listings or history) `--detail`
* :m:	Add option for dependency install (always on now) `--resolve`
* :m:	Implement `--limit` option for selection-match-count limiter; so user don't accidentally bust their rate limit using `$ tsd history  *` etc
* :m:	Implement `--min` / `--max` option to define expected result amount
* :o:	.... more

Functionality

* :m:	Report rate-limit properly
* :id:	Add github credentials (or tsdpm-proxy) to bypass busted rate limits (for bulk commands)
* :b:	Add fancy promise progress events + CLI display (install etc)

CLI

* :m:	Improve Expose for crisper CLI help screen layout (table/columns)
* :m:   Improve Expose to order/group commands :zap:
* :x:	Optimise and unify CLI output (expande `StyledOut.ts`)(indenting/seperator/headers etc) :zap:
* :o:	Improve CLI with [w-m/pleonasm](http://w-m.github.io/pleonasm/) :zap:
* :x:	Add TSD release/updates news to CLI console (periodically from github) (easy with cache using GithubAPI) :zap:
* :o:	Expand Expose to generate CLI documentation (using `StyledOut.ts` and a HTML/Markdown Styler + Writer)

API

* :o:	Export API docs during build :zap:
* :o:	Export TypeScript definitions :zap:
* :id:	Consider optimising or wrapping the JavaScript API (less OO-ish)
* :id:	Add options to authenticate to github API for higher rate-limit

Data model/repo

* :x:	Harden JSON import (there is some prototype schema in `./schema`)
* :id:	Consider decoupling from Github json format (abstract service)
* :id:	Consider adapting core to work from a git-checkout (abstract service)

Info

* :m:	Import tests for header parser from tsd-deftools @bartvds
* :o:	Improve `DefInfo`/`Parser` to extract more info from more files :zap:
* :id:	Consider dropping  `DefInfo`/`Parser` complications for cruder as-is report? :zap:

Config

* :m:	Improve config JSON-Schema (RegExp)
	* :m: Improve flexibility
	* :ab: Update tsd tests to verify changes
	* :m: Update ~~typingsPath~~ ('path' now): should be 1 length
	* :m: Update commit: should be (7-40) length (as per git convention)
	* :ng: ~~Update blob: should be optional, still fixed at 40 (as per concept commit is leading)~~ Killed: newline hell and redundant vs path+commit
* :m:	Validate config save-data before writing to diskk, catch invalid json
* :m:	Improve config validation reporting (see `tv4`, `chai-json-schema`)
* :m:	Consider renaming 'tsd-config.json' to 'tsd.json'

Cache

* :m:	Decide on user caching directory: home / AppData like npm
* :m:	Decide on cache folder version naming scheme
* :m:	Add cache auto-refresh; for the non-unique queries like `getBranch`
* :m:	Drop 'node-github' dependency and re-implement github API to leverage http-cache-headers (and rate timeout info)
* :a:	Add periodic automated cache purge/flush
* :m:	Add skip features to loaders; enforce for testing from local fixtures. 
* :id:	Consider blob cache by resolving commit sha to blob in a history; cache mappings; calc sha from content
* :ab:	Implement gzip for caches (integrat with http stream)
* :b:	Improve HTTPCache with node streams + gzip/deflate

Internals

* :ng:	~~Try recalculating sha1 hash from content~~ Not practical
* :ng:	Add local-changes detector using the blob hash / sha :zap:
* :o:	Add local-changes detector using custom hashes (like `xm.hashNormalines()` in `xm.hash.ts`) :zap:
* :m:	Change Context objects to use `Q`/`Q-io` and not auto-create folders at init
* :m:	Decide if API, Core etc need(more) race condition hardening (some in loaders)
* :b:	Don't keep file content/blobs in memory (load on demand + burst cache) 
* :m:	Consider if API and/or Core need to be split into command classes `/tsd/logics` (done)
* :vs:	Consider adding timeout (with option)
* :m:	Consider splitting Core.ts: index/select stuff vs helper methods/objects
* :ng:	Consider moving to class model with promise-based methods 
	* :id:	Could be cool but maybe needs bluebird for speed
* :m:	Consider adding class based façade to core
* :ng:	Consider global store for JSON pointers and RegExps etc (meh)
* :m:	Add xm ~~interface~~ class for debug/log/event tracking (`xm.EventLog`)
* :o2:	Use promise notifiy/progress for event tracking (being implements)
	* :a:	Needs a standard model (event-like) 
* :m:	Unify `xm.StatCounter` & `xm.Logger` into event tracker (and link child objects) (started in`xm.EventLog`)

Technical

* :m:	Move to TS 0.9 generics definition of Q promises
* :id:	Expand property / const immutability: Object.freeze()
* :id:	Ditch more getters + private vars for Object.freeze() (`xm.ObjectUtils`)
* :id:	Change some utils from static class members to module functions.

Infrastructure

* :o2:	Add npm pre-publish tests hook :zap:
* :o2:	Add test setup to test :zap:
* :x:	Add git pre-commit test hook :zap:
* :id:	Lint TypeScript JS output (using JSHint or ESlint)
* :id:	Validate `package.json` (and others) using json-schema.
* :a:	Run CLI test after build from the integrity test (saves a node.js start).


Cleanup

* :x:	Sweep and enable `tslint.json` rules
* :cl:	Clean `package.json`: fix some ~tildes before release
* :cl:	Sweep used modules: `require()` and `package.json`, dev vs runtime, npm prune 
* :cl:	Sweep facing code (API / Context etc) for input parameter checking(`xm.assertVar`) :zap:
* :cl:	Sweep and optimise reference-paths (but how? find auto-tool?) :zap:
* :cl:	Verify "use strict" (needed in node?)

Publishing

* :a:	Sweep and enable `tslint.json` rules we keep `./deploy/repository.json` for `v0.3.0`.
* :ok:	Use uppercase 'TSD' (looks like a type otherwise) ~~Decide docs use of name-casing: use either 'TSD' or 'tsd'? (npm and bower are lowercase)~~
* :vs:	Decide & sweep title/description text (package.json, cli/api, github etc)
* :vs:	Decide solution to update TSDPM.com: module and authenticated github with a DefinitelyTyped hook to heroku. Use TSD's Git module to proxy API request
* :m:	Fix bin/cli `$ npm install . -g` 
* :m:	Fix bin/cli `$ npm install git://github.com/Diullei/tsd#develop-0.5.x -g`
* :x:	Compile a build number + date into application :zap:
* :m:	Migrate licence to Apache 2.0
* :a:	Remove old MIT licence headers from xm-library (or externalise) (@Bartvds)

Dependencies

* :m:	Consider dropping `underscore`?
* :m:	Update `Q` with generics
* :o:	Sweep recent xm `package changes for new tests 

Bugs:

* :m:	Installing `$ tsd install chai` gives content error
* :a:	Installing `$ tsd search q` / `$ tsd search q/*` doesn't work properly
* :o:	Underscore.d.ts header has multiple authors

More.. always more :rocket:

## Emoji based Project Management 

Status indicators (with memory hint):

* :m:	Resolved and closed (*'mint!'*).
* :id:	Proposal or idea for consideration (idea).
* :vs:	Decision needed (this vs that).
* :sa:	Pending external action (servicing).
* :ok:	Decision made (ok).
* :ng:	Won't fix (no-go).
* :up:	Deployed (systems up).
* :a:	First priority (prio A).
* :b:	Second priority (prio B).
* :ab:	Important non-prioritised (A or B or ?).
* :cl:	Need to clean up (clean).
* :o2:	Open non immediate (zero).
* :x:	Acknowledged, pending on priority (status X).
* :o:	Incoming, undetermined (open).

Reserved (short codes):

* :cd:	Shipped? Released?
* :on:
* :tm:
* :+1:
* :-1:
* :v:

