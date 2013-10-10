# TSD 0.5.x SCOPE

> Project goals (and non-goals)

See also:

* Main [readme](../README.md)
* Some extra [info](INFO.md)
* Things [todo](TODO.md)
* More about [code](CODE.md)

## Goals

> TSD is a direct interface alternative to manually browsing the DefinitelyTyped Github web interface.

* Offer both a CLI and a node.js api to query the DefinitelyTyped Github repo as definition data source, and install and manage definition files.
* Functionality is based on the git data-model and additional information that can *realistically* be extracted from the community provided information (as-is):
	* Git branches define TypeScript compatibility versions.
	* Definitions are identified via their directory and filenames.
	* Definitions are versioned primarily by their revision history (primarily commit-sha and secondary by blob-sha).
	* Limited (inconsistent) information can be extracted from the definition source files (header and &lt;references&gt;).

> Effectively this makes TSD a read-only, domain specific Github client.

Additional goals:

* Usability:
	* Practical reporting & queries on all available fields.
	* Consistent command and option names.
	* Minimal HTTP traffic, maximal caching.
	* Links to Github html website (open in browser).
	* High reliability, fully testable.
* Zero added maintenance:
	* No dependency on manual updates.
	* No dependency on external servers.
	* No dependency on behaviour adjustment for typing community.
* Promote concentration of the community typing effort to DefinitelyTyped.
	* Likely no support for external repositories unless a really strong case can be made.

Out-of-scope:

* Implementing mapping definitions to their modules as defined in the various package managers.
* Implementing mapping module versions to their definitions (neither filenames or revisions).
* Implementing functionality focussed on specific module package managers.

Services that can enable correct mappings of definitions or working with specific package managers could be provided by a module (or the TSD api can be wrapped instead).
