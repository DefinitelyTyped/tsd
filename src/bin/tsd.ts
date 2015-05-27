declare var require: (path: string) => any

var pkg = require('../../package.json')

import program = require('commander')

const ALIASES: { [name: string]: string } = {
  i: 'install',
  in: 'install',
  r: 'uninstall',
  rm: 'uninstall',
  remove: 'uninstall',
  s: 'search',
  p: 'prune',
  pr: 'prune'
}

// This allows sub-commands to be rewritten with aliases.
program
  .on('*', function () {
    var cmd = program.args[0]
    var index = 0

    if (cmd === 'help') {
      cmd = program.args[1]
      index = 1
    }

    if (ALIASES[cmd]) {
      cmd = program.args[index] = ALIASES[cmd]
    }

    // Output the help text if the command does not exist.
    if (index === 0 && !(<any> program)._execs[cmd]) {
      program.outputHelp()
    }
  })

program
  .version(pkg.version)
  .command('install [name]', 'install one or more definitions')
  .command('uninstall [name]', 'remove definitions from tsd')
  .command('init', 'initialize a new tsd json file')
  .command('search [query]', 'search definitely typed for a definition')
  .command('prune', 'remove undefined dependencies')
  .parse(process.argv)
