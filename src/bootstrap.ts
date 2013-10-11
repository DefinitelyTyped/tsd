///<reference path="_ref.d.ts" />

var Q:typeof Q = require('q');
Q.longStackSupport = true;

require('source-map-support').install();

//TODO verify process.setMaxListeners() still needs to be this high
process.setMaxListeners(20);
