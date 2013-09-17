# TSD 0.5.x INFO

> Some development notes that will help understanding how TDS 0.5.x is rebuild

## Run it

Currently TSD 0.5.x is heavy under development. Use a git checkout to run it:

Pull dependencies:

	$ npm install

Build and test using grunt:

	$ grunt test

Build without running tests:

	$ grunt build

Use the test suite and/or a local checkout to develop. 

To run the CLI use:

	$ node ./build/cli.js <command>

For a preview install the global `tsd` cli command from a git-checkout:

	$ grunt build
    $ npm install . -g
	$ tsd -h
    $ tsd <command>

See the [TODO.md](TODO.md) document for info on where to find stuff to work on.

See grunt help and for gtx commands:

	$ grunt -h
	$ grunt gtx:tsd
	$ grunt gtx:git

## Main considerations:

Use DefinitelyTyped's Github repos directly as data source

* Use the Github REST apis
* Github API offers full access to Git and Repos data
* Github API is rate limited to 60 request per hour unless authenticated
* Github RAW gets file content and is not rate limited

Solution: 

* Use Github API only where necessary (index, history etc)
* Get definition files from Github RAW
* Cache Github API calls in a transparent, system wide cache

Complications:

* While git itself defines a unique file as a **blob** (by sha) the RAW interface only returns files by their path and **commit** (by sha). 
	* There are many commits reusing the same blob.
	* Working with blob hashes requires extra API requests to get hashes.
* Using full commit-trees is undesirable as DefinitelyTyped has many commits and many files.
* A commit + tree listing files is not necessary the commit that changed that specific file (it requires a more specific query).

This sub-optimal but workable as the RAW api is not rate-limited: cache misses on identical blobs due to file name addressing on fast changing commit-sha's will only hurt bandwidth.

## Model

Most classes and methods have a small comment hinting their use. 

Depends heavily on Promise's for async operation (using the excellent [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io).
 
### Source

Code in `/src`, also contains the 2 main files to compile to `/build` (`cli` and `api`)

Code modules: (short names, because lazy :)

`/tsd` - all TSD specific code
`/git` - holds Git and Github specific code (not coupled to TSD) 
`/xm` - general utils and helpers (not coupled to TSD) 

Main modules in `/tsd`

* `API` end-user module for code-based usage
* `CLI` code exposing `API` as cli commands

Data structure files in `/tsd/data`

* `DefIndex` is the central model that holds the extracted repository data and is also a factory for the data objects. It will try to maintain only a single instance per identification and re-use/re-issue them. Does *not* perform IO or interaction with the application.
* A single definition is a `Def`: 
	* Identified as a project + file name (parsed from its path)
* The Git versioned contents of a `Def` is a `DefVersion`. 
	* Identified as the combination of a `Def` and a `DefCommit`
	* It can hold the source code and the derivatives (parsed info, resolved dependencies, history etc)
	* Note: due to the rate-limit on the API the file content is get from Github RAW by path + commit-sha (instead of blob-sha): it is not workable to identify `DefVersion`s by their blob-sha without busting the rate-limit. Depending on the flow this means there can be `DefVersion` instances with different commits but identical file contents.
* A single commit is a `DefCommit`. 
	* Identified by its git sha.
	* Can hold meta-data (authors, message etc) 
	* Due to the many commits in DefinitelyTyped not all commits are loaded: only when relevant.
	* Due to the large amount of definitions in DefinitelyTyped and our limit on API-use, a `DefCommit` does NOT contain a git tree-object (as each generation tree contains many identical blobs).
* The other files are support or data objects uses by these main types. 
	* `DefUtils` has many utility helpers.   

Context and config model in `/tsd/context`

* `Context` bundles all settings sub-objects (very handy with testing).

Logical building blocks in `/tsd/logic`

* `Core` has the reusable functionality used to compose main features (used by itself and `API` etc)
	*  :point_right: Most of the interesting functionality happens here :point_left:
	* Also holds the central `DefIndex`
* Other files are split-of from `Core` for clarity 

Selector stuff `/tsd/select`

* `Selector` and related data objects:
	* `NameMatcher` matches the proejct/name-glob (needs expansion, see note in class)  

## Tests

The test suite is setup and has tests for some basics, but due to the rush to get the prototype it hasn't been updated as much as it should (as usual :).

This is a big flaw, so is high on the priority list to fix (but should be easy know the main app structure is workable).