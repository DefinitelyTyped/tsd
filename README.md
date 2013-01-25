TSD - A TypeScript definition package manager
=============================================

TSD is a TypeScript definition file package manager.  let you easily download and install definition files to use in TypeScript projects.

### How to install

TSD is installed using [node](http://nodejs.org/) and [npm](https://npmjs.org/). To install TSD use:

    npm install tsd -g

### Usage

> Your best friend at this stage is probably `tsd -h`.

To view all repository files use:

    tsd all

This will print all file definitions available on repository. To install some file on local project you must use `install` command followed by a lib name:

    tsd install node

This will create by default a folder named `d.ts` (if it doesn't exists) and will download the file definition to this folder.

### TSD configuration

You can define your own custom folder to store definition files with the command:

	tsd ncfg

This will create a file named `tsd-config.json` on current folder with the following content:

	{
		"localPath": "d.ts",
		"repositoryType": "1",
		"uri": "https://github.com/Diullei/tsd/raw/master/deploy/repository.json"
	}	

* **localPath** - Must be the path to your local folder to store definition files. This folder will be created in the first time if not exists.
* **repositoryType** - this property is used to define if uri is a local folder or a url. Use `0` to local folder or `1` to url.
* **uri** - Define if the repository file is an url or a local folder.

### Installing dependencies

Some definition files have dependencies of another files like `socket.io` that depends of `node`. To install dependencies you can use `tsd install` command followed by a list of libs to install. 

Example:

	tsd install sicket.io node express
	
This will install _express_, _socket.io_ and _node_ definitions.

### Install dependencies automatically

You can use `install*` command to allow TSD tool to automatically map and install all necessary dependencies. If you use `install* sochet.io` this will install `sochet.io` and `node` because `sochet.io` has `node` mapped as a dependency. If you use the command:

	tsd install* knockback
	
TSD will install `knockback`, `knockout` and `backbone` definition.

### Checking for updates

You can always use `tsd update` command to verify if your local libs are updated.

### Repository

To make a search for any file you must use `search` command.

Example:

    tsd search backbone

TSD get the file definitions from [DefinitelyTyped](https://github.com/borisyankov/DefinitelyTyped) project. You can view the repository references inside [repository.json](https://github.com/Diullei/tsd/blob/master/deploy/repository.json) file (I'm working to add some anothers). If you want to contribute please make a fork from tsd repo, change the repository.json and make a pull request.

> This file is updated constantly.

## Change log

### v0.3.0 (2013-01-25)

* Multiple installs at once install command [#3](https://github.com/Diullei/tsd/issues/3). Thanks to [@Crwth](https://github.com/Crwth)
* Command for show/info [#2](https://github.com/Diullei/tsd/issues/2). Thanks to [@semperos](https://github.com/semperos)
* Allow user to change repository url from local config file
* Command to create local config file
* Solved issue: DefinitelyTyped directory structure is lost [#4](https://github.com/Diullei/tsd/issues/4). Thanks to [@Crwth](https://github.com/Crwth)

### v0.2.2 (2012-11-07)

* Fix: now tsd works on linux/mac. Issue [#1](https://github.com/Diullei/tsd/issues/1). Thanks to [@seanhess](https://github.com/seanhess)

## License

TSD is distributed under the MIT license. [See license file here](https://raw.github.com/Diullei/tsd/master/LICENSE.txt) or below:

Copyright (c) 2012 by Diullei Gomes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.