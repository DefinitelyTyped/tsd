/// <reference path="../src/_ref.d.ts" />
import API = require('./tsd/API');
export import Def = require('./tsd/data/Def');
export import Context = require('./tsd/context/Context');
export import Options = require('./tsd/Options');
export import Query = require('./tsd/select/Query');
export import CommitMatcher = require('./tsd/select/CommitMatcher');
export import DateMatcher = require('./tsd/select/DateMatcher');
export import InfoMatcher = require('./tsd/select/InfoMatcher');
export import VersionMatcher = require('./tsd/select/VersionMatcher');
export import defUtil = require('./tsd/util/defUtil');
export import getContent = require('./getContent');
export declare function getAPI(configPath: string, verbose?: boolean): API;
