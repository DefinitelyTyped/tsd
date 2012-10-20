TSD - A TypeScript definition package manager
=============================================

TSD is a TypeScript definition file package manager. Its lets you easily download and install definition files to use in TypeScript projects.

### How to install

TSD is installed using node and npm. To install tsd use:

    npm install tsd -g

### Usage

To view all repository files use:

    tsd all

This will print all file definitions available on repository. To install some file on local project you must use ```install``` followed by a lib name:

    tsd install node

This will create a folder named ```d.ts``` if not exists and will download the file definition to this folder.

To make a search for any file you must use ```search``` command.

    tsd search backbone

## License

TSD is distributed under the MIT license. [See license file here](https://raw.github.com/Diullei/tsd/master/LICENSE.txt) or below:

Copyright (c) 2012 by Diullei Gomes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.