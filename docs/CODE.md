# TSD 0.5.x CODE

> Technical stuff

:point_right: This info might be outdated.

See also:

* Main [readme](../README.md)
* Project [scope](SCOPE.md)
* Some extra [info](INFO.md)
* Things [todo](TODO.md)

## Implementation

Most classes and methods have a small comment at the start of the declaration hinting their use. 

Depends heavily on Promise's for async operation (using the excellent [kriskowal/q](https://github.com/kriskowal/q) and [kriskowal/q-io](https://github.com/kriskowal/q-io).
 
### Source


Code in `/src`, also contains the 2 main files to compile to `/build` (`cli` and `api`)

Code modules: (short names, because lazy :)

`/tsd` - all TSD specific code
`/git` - holds Git and Github specific code (not coupled to TSD) 
`/xm` - general utils and helpers (breeding code for my `typescript-xm` lib) (not coupled to TSD) 

Main modules in `/tsd`

* `API` end-user module for code-based usage
* `CLI` code exposing `API` as cli commands
* `Core` has the reusable logic

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

Selector stuff `/tsd/select`

* `Selector` and related data objects:
	* `NameMatcher` matches the proejct/name-glob (needs expansion, see note in class)  

