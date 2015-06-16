'use strict';
var bootstrap = require('./bootstrap');
var API = require('./tsd/API');
var assertVar = require('./xm/assertVar');
exports.Def = require('./tsd/data/Def');
exports.Context = require('./tsd/context/Context');
exports.Options = require('./tsd/Options');
exports.Query = require('./tsd/select/Query');
exports.CommitMatcher = require('./tsd/select/CommitMatcher');
exports.DateMatcher = require('./tsd/select/DateMatcher');
exports.InfoMatcher = require('./tsd/select/InfoMatcher');
exports.VersionMatcher = require('./tsd/select/VersionMatcher');
exports.defUtil = require('./tsd/util/defUtil');
exports.getContent = require('./getContent');
function getAPI(configPath, verbose) {
    if (verbose === void 0) { verbose = false; }
    assertVar(configPath, 'string', 'configPath');
    return new API(new exports.Context(configPath, verbose));
}
exports.getAPI = getAPI;
[
    bootstrap,
    exports.getContent,
    exports.Def,
    exports.Options,
    exports.Query,
    exports.Context,
    exports.CommitMatcher,
    exports.DateMatcher,
    exports.InfoMatcher,
    exports.VersionMatcher,
    exports.defUtil
];
//# sourceMappingURL=api.js.map