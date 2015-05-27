import program = require('commander')
import { handle } from './lib/handle'
import { create, upgrade } from '../tsd'

const cwd = process.cwd()

program
  .option('-u, --upgrade', 'upgrade from `tsd.json` <= 0.6')
  .parse(process.argv)

if (program.opts().upgrade) {
  handle(upgrade(cwd))
} else {
  handle(create(cwd))
}
