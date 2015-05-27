import { join, dirname } from 'path'
import { expect } from 'chai'
import proxyquire = require('proxyquire')
import * as Resolve from './resolve'

describe('resolve', function () {
  it('should resolve a filename', function () {
    const resolve = <typeof Resolve> proxyquire('./resolve', {
      'fs-promise': {
        stat (filename: string) {
          return Promise.resolve({
            isFile: () => true
          })
        }
      }
    })

    return expect(
      resolve.resolve(__dirname, 'foobar')
    ).to.eventually.equal(join(__dirname, 'foobar'))
  })

  it('should stop resolving at the root directory', function () {
    const resolve = <typeof Resolve> proxyquire('./resolve', {
      'fs-promise': {
        stat (filename: string) {
          return Promise.resolve({
            isFile: () => false
          })
        }
      }
    })

    return expect(resolve.resolve(__dirname, 'foobar')).to.be.rejected
  })

  it('should resolve to a parent directory', function () {
    let index = 0

    const resolve = <typeof Resolve> proxyquire('./resolve', {
      'fs-promise': {
        stat (filename: string) {
          return Promise.resolve({
            isFile: () => ++index === 2
          })
        }
      }
    })

    return expect(
      resolve.resolve(__dirname, 'foobar')
    ).to.eventually.equal(join(dirname(__dirname), 'foobar'))
  })
})
