'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var tsd = require('../build/api');

tsd.getContent({config: path.resolve(__dirname, '..', 'tsd.json')}).then(function(index) {
	mkdirp.sync(path.resolve(__dirname, '..', 'tmp'));
	fs.writeFileSync(path.resolve(__dirname, '..', 'tmp', 'index.json'), JSON.stringify(index, null, '  '), 'utf8');
});
