import { join } from 'path'
import { expect } from 'chai'
import proxyquire = require('proxyquire')
import * as Init from './init'
import { upgradeTsdJson } from './init'

describe('init', function () {
  it('should initialize `tsd.json`', function () {
    const init = <typeof Init> proxyquire('./init', {
      './lib/resolve': {
        resolveTsdJson () {
          return Promise.resolve()
        }
      },
      'fs-promise': {
        writeFile (filename: string, data: string) {
          expect(filename).to.equal(join(__dirname, 'tsd.json'))

          expect(data).to.equal([
            '{',
            '  "main": "",',
            '  "dependencies": {},',
            '  "devDependencies": {}',
            '}'
          ].join('\n'))

          return Promise.resolve(null)
        }
      }
    })

    return init.create(__dirname)
  })

  it('should upgrade an old `tsd.json`', function () {
    var tsdJson = upgradeTsdJson({
      version: 'v4',
      repo: 'borisyankov/DefinitelyTyped',
      ref: 'master',
      path: 'typings',
      bundle: 'typings/tsd.d.ts',
      installed: {
        'react/react.d.ts': {
          commit: 'b0056383b51495b373a32b791de8112fcafe2ace'
        },
        'flux/flux.d.ts': {
          commit: 'b0056383b51495b373a32b791de8112fcafe2ace'
        },
        'node/node.d.ts': {
          commit: '61d066fef5a1ac9e2389b51b9cf88746b7bbfde9'
        }
      }
    })

    expect(tsdJson).to.deep.equal({
      ambientDependencies: [
        'github:borisyankov/DefinitelyTyped/react/react.d.ts#b0056383b51495b373a32b791de8112fcafe2ace',
        'github:borisyankov/DefinitelyTyped/flux/flux.d.ts#b0056383b51495b373a32b791de8112fcafe2ace',
        'github:borisyankov/DefinitelyTyped/node/node.d.ts#61d066fef5a1ac9e2389b51b9cf88746b7bbfde9'
      ]
    })
  })
})
