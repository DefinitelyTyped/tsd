# TSD 0.5.x TODO

> Tracking work that needs to be done

See the [INFO.md](INFO.md) for project development info.

## Issues

This info might later migrate to the Github Issue tracker.

## Local changes

Browse the code in `/src` and `/test` for `//TODO` comments,

Or use `$ grunt todos` for an overview. :point_left::+1:

:warning: Most (but not all) of these are file/class/block 'local' changes so easy to fix without conflicts (filling out prototype stuff, hardening, re-implement etc), note: some are more important then others.

## Global / multi-file changes:

Must fix:

* [ ] Improve tests for API
* [ ] Improve tests for CLI
* [ ] Improve tests for modules, parts and utils
* -
* [x] Decide on caching directory: home / AppData like npm
* [ ] Add cache auto-refresh; for the non-unique queries like `getBranch`
* [x] Change Context objects to use Q/Q-io and not auto-create folders at init until properly configured.
* [ ] Decide if raw.github needs its cache; maybe just keep for testing but skip for production?
* [x] Fix tsd global bin/cli, test using `$ npm install . -g`
* -
* [ ] Add some options and unify their names (both for CLI as API)
* [ ] Add selection-match-count limiter so user don't accidentally bust their rate limit using `tsd history  *` etc.
* [ ] Find solution to update TSDPM.com: use tsd's module api and authenticated github and a DefinitelyTyped github hook to the heroku app.
* [ ] Verify correct promise error handling (in mid-flow, at end of api & cli and in tests)
* [ ] Add option for file overwrite (always on now)

Should fix:

* [ ] Add support for multiple Selectors 
* [ ] Add option for dependency install (always on now)
* [ ] Add InfoMatcher to Selector / select()
* [ ] Add search-by-date to history-command, add as DateMatcher to Selector / select()
* [ ] Add remove/uninstall command
* [ ] Add list command / option (display compact result listing for repo overview)
* [ ] Add manual purge/flush-command
* [ ] Add periodic automated purge/flush
* [ ] Add github credentials (or tsdpm-proxy) to bypass busted rate limits (for bulk commands)
* * [ ] Add command for (re) initialisation of config (when you want to start in non-default branch etc)  
* [x] Import tests for header parser from tsd-deftools @bartvds
* [ ] Improve / harden DefInfo/Parser to extract more info, from more files
* [ ] Add a global store for JSON pointers and RegExps etc
* [ ] Sweep facing code for input parameter checking (`xm.assertVar`)
* [ ] Decide if API and/or Core etc need a queue-sytem hardening (module use might (partially) be race condition unsafe)
* [ ] Sweep used modules: require() and package.json
* [x] Improve Expose for crisper CLI help screen layout (table/columns)
* [ ] Add npm pre-publish tests
* [ ] Update config's JSON-Schema and improve validation reporting
* [ ] Sweep and optimise reference-paths, but how?
* [ ] Verify "use strict" (needed in node?)
* [ ] Consider adding timeouts?
* [ ] Clean package.json: fix ~tildes before release, dev vs runtime, npm prune
* [ ] Add TSD release/updates news to CLI console (periodically pull package.json from github)

Could fix:

* [ ] Consider g-zip for caches
* [ ] Consider splitting Core.ts: index/select stuff vs helper methods/objects
* [ ] Check for missing extra commands (compare etc)
* [ ] Add property locking: Object.freeze() etc to data objects; ditch getters-only private vars for freeze/read-only. (partially implemented using `xm.ObjectUtils`)
* [ ] Add feature to open a browser to see the pages on github? (diffs, comments etc)
* [ ] Add feature to open a browser at a project's url (from info)
* [ ] Add fancy promise progress events + cli display (install etc)
* [ ] Improve blob cache by always resolving commit sha to blob in history and cache the blob/commit mappings. 


