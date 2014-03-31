'use strict';
require('./bootstrap');

var assertVar = require('./xm/assertVar');
var API = require('./tsd/API');
var Context = require('./tsd/context/Context');

function getAPI(configPath, verbose) {
    if (typeof verbose === "undefined") { verbose = false; }
    assertVar(configPath, 'string', 'configPath');
    return new API(new Context(configPath, verbose));
}
exports.getAPI = getAPI;
//# sourceMappingURL=api.js.map
