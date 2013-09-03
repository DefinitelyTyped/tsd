# TSD 0.5.x TODO

#### Local changes

Browse the code in `/src` and `/test` for `//TODO` comments,

Or use `$ grunt todos` for an overview. :point_left::+1:

:warning: Most (but not all) of these are file/class/block 'local' changes so easy to fix without conflicts (filling out prototype stuff, hardening, re-implement etc), note: some are more important then others.

#### Global / mutli-file changes:

Must fix:

* [ ] Improve tests for API
* [ ] Improve tests for CLI
* [ ] Improve tests for modules, parts and utils
* -
* [ ] Decide on caching directory: sub folder of tmp? home/user? need tmp at all?
* [ ] Add cache auto-refresh; for the non-unique queries like `getBranch`
* [ ] Change Context objects to use Q/Q-io and not auto-create folders at init until properly configured.
* [ ] Decide if raw.github needs its cache; maybe just keep for testing but skip for production?
* -
* [ ] Add some options and unify names (both cli as API)
* [ ] Add selection-match-count limiter so user don't accidentally bust their rate limit using `tsd history  *` etc.

Should fix:

* [ ] Add InfoMatcher to Selector / select()
* [ ] Add search-by-date to history-command, add as DateMatcher to Selector / select()
* [ ] Add manual purge/flush-command
* [ ] Add periodic automated purge/flush
* [ ] Add github credentials (or tsdpm-proxy) to bypass busted rate limits (for bulk commands)  
* [ ] Import tests for header parser from tsd-deftools @bartvds
* [ ] Improve DefInfo/Parser to extract more info
* [ ] Add a global store for JSON pointers and RegExps etc
* [ ] Refactor Core: split up: index/select stuff vs helper methods/objects
* [ ] Sweep facing code for input parameter checking (`xm.assertVar`)
* [ ] Decide if API and/or Core etc need a queue-sytem hardening (module use might be race condition unsafe)
* [ ] Sweep used modules: require() and package.json
* [ ] Improve Expose for crisper CLI help screen layout (table/columns)
* [ ] Add npm pre-publish tests

Could fix:

* [ ] Consider g-zip for caches
* [ ] Check for missing extra commands (compare etc)
* [ ] Add TSD release updates/news to CLI console (pull package.json oid from github)
* [ ] Add property locking: Object.freeze() etc to data objects; ditch getters-only private vars for groze/read-only.
* [ ] Add feature to open a browser to see the pages on github? (diffs, comments etc)
* [ ] Add feature to open a browser at a project's url (from info)



