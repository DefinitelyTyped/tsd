#!/usr/bin/env node

// note: it is critical this file has unix line-endings

require('./bootstrap');
require('./tsd/CLI').runARGV(process.argv);
