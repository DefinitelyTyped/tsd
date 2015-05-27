import program = require('commander')
import { handle } from './lib/handle'
import { resolveTsdProject } from '../lib/resolve'
import { install, installDependency, installAndSaveDependency } from '../tsd'

program
  .option('-s, --save', 'save the dependencies to `tsd.json`')
  .option('-n, --name [name]', 'save the dependency with a name')
  .parse(process.argv)

const opts = program.opts()
let installation = resolveTsdProject(process.cwd())

if (program.args.length) {
  installation = installation.then<any>(function (path) {
    var dependencies = program.args
      .map(function (arg) {
        if (opts.save) {
          return installAndSaveDependency(path, arg)
        }

        return installDependency(path, arg)
      })

    return Promise.all(dependencies)
  })
} else {
  installation = installation.then<any>(install)
}

handle(installation)
