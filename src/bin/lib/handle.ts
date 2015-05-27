import chalk = require('chalk')

export function handle (p: Promise<any>) {
  return p
    .then(function () {
      return process.exit(0)
    })
    .catch(function (err: Error) {
      console.log(chalk.red(err.message))

      process.exit(1)
    })
}
