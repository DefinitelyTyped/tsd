import os = require('os');
import chalk = require('chalk');
import fs = require('fs');
import path = require('path');

var pack = require('../../../package.json');

function logError(tag: string, message: string, print: boolean = true): string {
    if (print) {
        console.log(chalk.red('[ERR!] ') + (tag !== null ? <any>chalk.magenta(tag) : '') + message);
    }
    return '[ERR!] ' + (tag !== null ? tag : '') + message + '\n';
}

function normalizeError(e): any {
    if (typeof e === 'string' || e instanceof String) {
        e = {message: e};
    }

    var m = e.code || (e.message.match(/^(?:Error: )?(E[A-Z]+)/) ? e.message.match(/^(?:Error: )?(E[A-Z]+)/)[1] : null);
    if (m && !e.code) {
        e.code = m;
    }

    return e;
}

export function handler(e: any) {
    var logFile = '';

    e = normalizeError(e);

    if (e.code === 'EGITIHAPI') {
        logError('GitHub API: ', [
                'GitHub rate limit reached.',
                '    To increase the limit use GitHub authentication.',
                '    See: https://github.com/DefinitelyTyped/tsd#tsdrc',
                ''
            ].join('\n'));
        process.exit(1);
    }

    logFile += logError('cwd  : ', process.cwd());

    logFile += logError('os   : ', os.type() + ' ' + os.release());
    logFile += logError('argv : ', process.argv.map(JSON.stringify).join(' '));
    logFile += logError('node : ', process.version);
    logFile += logError('tsd  : ', pack.version);
    logFile += logError('Error: ', e.message);
    logFile += logError('CODE : ', e.code);

    switch (e.code) {
        case 'ECONNREFUSED':
            logFile += logError(null, e);
            logFile += logError(
                null,
                [
                    '\nIf you are behind a proxy, please make sure that the \'proxy\' config',
                    ' is set properly.  See: https://github.com/DefinitelyTyped/tsd#tsdrc'
                ].join('\n'),
                true
            );
            break;

        case 'EACCES':
        case 'EPERM':
            logFile += logError(null, e);
            logFile += logError(null, '\nPlease try running this command again as root/Administrator.');
            break;

        case 'ECONNRESET':
        case 'ENOTFOUND':
        case 'ETIMEDOUT':
        case 'EAI_FAIL':
        case 'EAI_AGAIN':
            logFile += logError(
                null,
                [
                    e.message,
                    'This is most likely not a problem with tsd itself',
                    'and is related to network connectivity.',
                    'In most cases you are behind a proxy or have bad network settings.',
                    '\nIf you are behind a proxy, please make sure that the',
                    '\'proxy\' config is set properly.  See: https://github.com/DefinitelyTyped/tsd#tsdrc'
                ].join('\n')
            );
            break;

        case 'ENOSPC':
            logFile += logError(
                null,
                [
                    e.message,
                    'This is most likely not a problem with tsd itself',
                    'and is related to insufficient space on your system.'
                ].join('\n')
            );
            break;

        case 'EROFS':
            logFile += logError(
                null,
                [
                    e.message,
                    'This is most likely not a problem with tsd itself',
                    'and is related to the file system being read-only.',
                    '\nOften virtualized file systems, or other file systems',
                    'that don\'t support symlinks, give this error.'
                ].join('\n')
            );
            break;

        case 'ENOENT':
            logFile += logError(
                null,
                [
                    e.message,
                    'This is most likely not a problem with tsd itself',
                    'and is related to tsd not being able to find a file.',
                    e.file ? '\nCheck if the file \'' + e.file + '\' is present.' : ''
                ].join('\n')
            );
            break;

        default:
            logFile += logError(null, e.message || e);
            logFile += logError(
                null,
                [
                    'If you need help, you may report this error at:',
                    '    https://github.com/DefinitelyTyped/tsd/issues',
                    ''
                ].join('\n')
            );
            break;
    }

    if (e.stack) {
        logFile += logError(null, '\n' + e.stack + '\n', false);
    }

    try {
        var foundConfigFlag = false;
        var configFlagIndex = -1;

        process.argv.forEach((arg, index) => {
            if (arg === '--config' || arg === '-c') {
                foundConfigFlag = true;
                configFlagIndex = index;
            }
        });

        var tsdjson = require(path.resolve(path.join(process.cwd(), foundConfigFlag ? process.argv[configFlagIndex + 1] : 'tsd.json')));
        logFile += logError('tsd.json: ', JSON.stringify(tsdjson) + '\n', false);
    } catch (err) {
        logFile += logError(null, 'tsd.json could not be retrieved\n');
    }

    try {
        var tsdrc = require(path.resolve(path.join(process.cwd(), '.tsdrc')));
        logFile += logError('.tsdrc : ', JSON.stringify(tsdrc) + '\n', false);
    } catch (err) {
        logFile += logError(null, '.tsdrc could not be retrieved\n');
    }

    logFile += logError(null, [
            'Please include the following file with any support request:',
            '    ' + path.resolve(path.join(process.cwd(), 'tsd-debug.log')),
            ''
        ].join('\n'));

    fs.writeFileSync(path.join(process.cwd(), 'tsd-debug.log'), logFile);

    process.exit(typeof e.errno === 'number' ? e.errno : 1);
}
