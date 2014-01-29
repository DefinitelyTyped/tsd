# TSD 0.5.x INFO

> Some development notes that will help understanding how TDS 0.5.x is rebuild

:point_right: This is valid but outdated. Next generation migth use [js-git](https://github.com/creationix/js-git) for improved access to the repository data. 

See also:

* Main [readme](../README.md)
* Things [todo](TODO.md)
* More about [code](CODE.md)

## Considerations

### Problem with previous TSD (< 0.5)

In it current state it is not useful as the content is growing stale. The main issue there is the separated data structure that adds complexity:

*	Maintaining a module-vs-definition version mapping and history is problematic as sources change.
*	Merging DefinitelyTyped data is not reliable when files are renamed improperly (untrackable).
*	Offering support for other endpoints is adds complexity cost with low return.
*	(Re-)install from local data-file information is unreliable as multiple layers of repository data change over time.

### Observation

*	Not many users are adding items to TSD
*	Automatically updating is troublesome and unreliable. 
*	DefinitelyTyped is the de-facto community repository for TypeScript type definitions.

## Solution

Drop complications from technical and conceptual debt:

*	Let go of separate data structure.
*	Let go of multi source repository support.
*	Simplify or delegate definition/module versioning responsibility.

Use DefinitelyTyped's Github repos directly as data source:

* Github **API** gets all repo data but is rate limited to **60 request per hour** unless authenticated.
* Github **RAW** gets file content only (by commit+path) and is **not rate limited**.

### Complications

* While git itself defines a unique file as a **blob** (by sha) the RAW interface only returns files by their path and **commit** (by sha). 
	* There are many commits reusing the same blob.
* Using full commit-trees is undesirable as DefinitelyTyped has many commits and many files.
* A given commit + tree listing files is not necessary the commit that changed that specific file (it requires a specific history query on a single file).
* The community provided (meta-)data is imperfect:
	* Mapping of definition files to the projects as found on package managers is incomplete and not universal: there are many additional package managers.  
	* Version information is non-existant or in-complete.

### Solution

* Use Github API only where necessary (index, history etc).
* Get definition files from Github RAW.
* Cache Github API calls in a transparent, system wide cache.
* It is possible to calculate a blob's sha1 hash from the [file content](http://stackoverflow.com/questions/552659/assigning-git-sha1s-without-git).

This commit-sha based approach is sub-optimal but workable as the RAW access is not rate-limited, and cache misses on identical blobs due to file name addressing on changing commit-sha's will only hurt bandwidth.