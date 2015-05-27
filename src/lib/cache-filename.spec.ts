import { expect } from 'chai'
import { url } from './cache-filename'
import { join } from 'path'

describe('cache filename', function () {
  describe('url', function () {
    it('should generate a consistent location', function () {
      expect(url(__dirname, 'http://example.com/foo/bar.d.ts')).to.equal(
        join(__dirname, 'example.com/foo/bar.d.ts')
      )
    })
  })
})
