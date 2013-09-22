# TSD 0.5.x TODO

> Big list of things that should/could be done.

See the [INFO.md](INFO.md) for project info and the [README.md](../README.md) for usage and installation.

## Issues

This info might later migrate to the Github Issue tracker.

## Update docs

Always text to edit in the README or docs.

## Local changes

Browse the code in `/src` and `/test` for `//TODO` comments,

Or use `$ grunt todos` for an overview. :point_left::+1:

Most of these are file/class/block 'local' changes: easy to fix without conflicts (hardening, re-implement etc). Note: some are more important then others (but which ones? :smiley_cat:)

## Tests

Never enough.

* [ ] Expand API command testing; besides search/install (once update fixtures land)
* [ ] Add CLI tests
* [ ] Add node.js module tests
* [ ] Consider testing JavaScript output instead of TypeScript source.

Working on a way run data tests from fixtures that can be updated easily (otherwise decent coverage is insane to manage) 

* [x] Run github api+raw caches from fixtures (with easy updates/expansion)
* [ ] Run API tests from fixtures and stored comparison output (with easy updates/expansion)

## Global / multi-file changes:

### Commands

Basics commands

* [x] Add help (show commands) 
* [x] Add version (show version)
* [ ] Add init (new json with repo/branch)
* [x] Add settings (show config info)
* [ ] Consider unifying local/remote selectors (tricky)

Remote selector commands

* [x] Add search (search definitions)
* [x] Add install (install definitions)
* [x] Add info (parse file content)
* [x] Add history (list commit history)
* [ ] Add details (detailed commit history), needed?
* [ ] Enhance deps (list dependencies), make recursive and display

Local selector commands

* [ ] Add local (search local files)
* [ ] Add uninstall (remove local files)
* [ ] Add compare (check for updates)
* [ ] Add update (apply updates)

Browser commands

* [ ] Add feature to open a browser to see the pages on github? (diffs, comments etc)
* [ ] Add feature to open a browser at a project's url (from info)

Cache commands

* [ ] Add purge (or flush)

Selector

* [ ] Improve globbing/RegExp
* [ ] Add support for semver
* [ ] Add support for multiple Selectors (blend results in select())
* [ ] Add InfoMatcher to Selector / select()
* [ ] Add search-by-date to history-command, add as DateMatcher to Selector / select()

Command options

* [ ] Design / document options and unify the names (both for CLI as API)
* [ ] Add option for file overwrite (always on now)
* [ ] Add a compact vs detailed option (for search listings or history)
* [ ] Add option for dependency install (always on now)
* [ ] Add option for selection-match-count limiter; so user don't accidentally bust their rate limit using `tsd history  *` etc
* [ ] .... more

Functionality

* [ ] Add github credentials (or tsdpm-proxy) to bypass busted rate limits (for bulk commands)
* [ ] Add fancy promise progress events + cli display (install etc)

CLI

* [x] Improve Expose for crisper CLI help screen layout (table/columns)
* [ ] Improve Expose to order/group commands
* [ ] Optimise and unify CLI output (indenting/seperator/headers etc) 
* [ ] Improve CLI with [w-m/pleonasm](http://w-m.github.io/pleonasm/)
* [ ] Add TSD release/updates news to CLI console (periodically pull json from github)

API

* [ ] Export docs during build
* [ ] Export TypeScript definitions
* [ ] Consider optimising JavaScript API (less OO-ish)
* [ ] Add options to authenticate to github API for higher rate-limit

Data model

* [ ] Harden JSON import
* [ ] Consider decoupling from Github json format?

Info

* [x] Import tests for header parser from tsd-deftools @bartvds
* [ ] Improve DefInfo/Parser to extract more info from more files

Config

* [ ] Rename 'ref' to 'branch' (everywhere..)
* [x] Improve config JSON-Schema
* [ ] Improve config validation reporting (see tv4, chai-json-schema)
* [ ] Consider renaming 'tsd-config.json'

Cache

* [x] Decide on caching directory: home / AppData like npm
* [ ] Decide on cache folder version naming scheme
* [ ] Add cache auto-refresh; for the non-unique queries like `getBranch`
* [ ] Add periodic automated cache purge/flush
* [x] Add skip features to loaders; enforce for testing from local fixtures. 
* [ ] Consider blob cache by resolving commit sha to blob in a history; cache mappings; calc sha from content
* [ ] Consider g-zip for caches

Internals

* [ ] Try recalculating sha1 hash from content
* [ ] Add local-changes detector using the hash / sha
* [ ] Consider adding timeouts
* [x] Change Context objects to use Q/Q-io and not auto-create folders at init
* [ ] Decide if API, Core etc need(more) race condition hardening
* [ ] Consider global store for JSON pointers and RegExps etc
* [ ] Consider splitting Core.ts: index/select stuff vs helper methods/objects

Technical

* [ ] Decide on property immutability: Object.freeze()
* [ ] Ditch getters + private vars for freeze (`xm.ObjectUtils`)
* [ ] Unify `xm.StatCounter` & `xm.Logger` into event tracker (and link child objects)
* [ ] Add xm interface for debug/log/event tracking
* [ ] Verify "use strict" (needed in node?)

Cleanup

* [ ] Clean `package.json`: fix ~tildes before release, dev vs runtime, npm prune
* [ ] Sweep used modules: require() and `package.json`
* [ ] Sweep facing code for input parameter checking (`xm.assertVar`)
* [ ] Sweep and optimise reference-paths (but how?)

Publishing

* [ ] Add npm pre-publish tests
* [ ] Add git pre-publish tests
* [ ] Decide docs use of name-casing: use either TSD or tsd? (npm and bower are lowercase)
* [ ] Decide & sweep title/description text (package.json, cli/api, github etc)
* [ ] Find solution to update TSDPM.com: module and authenticated github with a DefinitelyTyped hook to heroku.
* [x] Fix bin/cli `$ npm install . -g` 
* [x] Fix bin/cli `$ npm install git://github.com/Diullei/tsd#develop-0.5.x -g`
* [ ] Compile a build number + date into application

Dependencies

* [ ] Drop underscore?
* [ ] Add tests for any recent xm `package changes

More.. always more :rocket:

