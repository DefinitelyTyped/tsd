# TSD 0.5.x TODO

#### Local changes

Browse the code in `/src` and `/test` for `//TODO` comments, or use `$ grunt todos` for an overview.

Most of these are file/class/block 'local' changes so easy to fix without conflicts (filling out prototype stuff, hardening, re-implement etc), note: some are more important then others.

#### Global / mutli-file changes:

Must

* [ ] Improve tests for api
* [ ] Improve tests for cli
* [ ] Improve tests for modules and utils: tsd, xm, git
* -
* [ ] Decide on caching directory: sub folder of tmp? home/user? need tmp at all?
* -
* [ ] Change Context objects to use Q/Q-io and not auto-create folders at init until properly configured.
* -
* [ ] Add selection-match count limiter so user don't accidentally bust their rate limit using `tsd history  *` etc.
* [ ] Add cache auto-refresh (for the non-unique queries like `getBranch`)

Should

* [ ] Add purge/flush command
* [ ] Add github credentials or tsdpm-proxy solution for busted rate limits 
* [ ] Import header parser test from tsd-deftools
* [ ] Add a global store for JSON pointers and RegExps etc

Could

* [ ] Consider g-zip for caches
* [ ] Check for missing extra commands (compare etc)
* [ ] Add TSD release updates/news to CLI console (pull package.json oid from github)
* [ ] Add property locking: Object.freeze() etc to data objects; ditch getters-only private vars for groze/read-only.
* [ ] Open a browser window to github to compare diffs?




