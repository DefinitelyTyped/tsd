/// <reference path="./_ref.d.ts" />

import Logger = require('./log/Logger');
import getLogger = require('./log/getLogger');

var log: Logger = getLogger();

export = log;
