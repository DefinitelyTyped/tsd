#!/usr/bin/env node

// note: it is critical this file has unix line-endings, or it will trigger
//
//     env: node\r: No such file or directory
//
// https://github.com/yeoman/yeoman/issues/1236

// handler is compiled into main codebase
require('./api').runARGV(process.argv);
