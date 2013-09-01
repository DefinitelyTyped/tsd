# TSD 0.5.x TODO

#### Local changes

Search the code in /src and /test for `//TODO` comments: `/\/\/[ \t]*TODO/g`

Most of those require file/block local changes (filling out prototype stuff).

#### Global / mutli-file changes:

Must

* [ ] Unit tests for api
* [ ] Unit tests for cli
* [ ] Unit tests for utils: tsd, xm, git
* -
* [ ] Decide on caching directories: tmp? home/user? need tmp at all?
* -
* [ ] Change Context to not create folders at init
 

Should

* [ ] Change Context to q-io and support fake filesystems


Could
* [ ] Add TSD release updates/news to CLI console (pull package.json etc from github)
* [ ] Optimise property locks: Object.freeze() etc to data objects, ditch getters-only private vars
* [ ] Open a browser window to github to compare diffs?


