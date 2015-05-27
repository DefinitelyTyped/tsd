import { expect } from 'chai'
import { parseDependency } from './parse'

describe('parse', function () {
  describe('parse dependency', function () {
    describe('filename', function () {
      it('should parse', function () {
        expect(parseDependency('file:./foo/bar.d.ts')).to.deep.equal({
          raw: 'file:./foo/bar.d.ts',
          location: 'foo/bar.d.ts',
          type: 'file'
        })
      })

      it('should parse relative', function () {
        expect(parseDependency('file:foo/bar.d.ts')).to.deep.equal({
          raw: 'file:foo/bar.d.ts',
          location: 'foo/bar.d.ts',
          type: 'file'
        })
      })
    })

    describe('npm', function () {
      it('should parse', function () {
        expect(parseDependency('npm:foobar')).to.deep.equal({
          raw: 'npm:foobar',
          type: 'npm',
          location: 'foobar'
        })
      })

      it('should parse scoped packages', function () {
        expect(parseDependency('npm:@foo/bar')).to.deep.equal({
          raw: 'npm:@foo/bar',
          type: 'npm',
          location: '@foo/bar'
        })
      })
    })

    describe('bower', function () {
      it('should parse', function () {
        expect(parseDependency('bower:foobar')).to.deep.equal({
          raw: 'bower:foobar',
          type: 'bower',
          location: 'foobar'
        })
      })
    })

    describe('github', function () {
      it('should parse and append `tsd.json`', function () {
        expect(parseDependency('github:foo/bar')).to.deep.equal({
          raw: 'github:foo/bar',
          type: 'hosted',
          location: 'https://raw.githubusercontent.com/foo/bar/master/tsd.json'
        })
      })

      it('should parse with sha and append `tsd.json`', function () {
        expect(parseDependency('github:foo/bar#test')).to.deep.equal({
          raw: 'github:foo/bar#test',
          type: 'hosted',
          location: 'https://raw.githubusercontent.com/foo/bar/test/tsd.json'
        })
      })

      it('should parse direct references to `d.ts` files', function () {
        expect(parseDependency('github:foo/bar/typings/tsd.d.ts')).to.deep.equal({
          raw: 'github:foo/bar/typings/tsd.d.ts',
          type: 'hosted',
          location: 'https://raw.githubusercontent.com/foo/bar/master/typings/tsd.d.ts'
        })
      })

      it('should parse direct references to `tsd.json` files', function () {
        expect(parseDependency('github:foo/bar/src/tsd.json')).to.deep.equal({
          raw: 'github:foo/bar/src/tsd.json',
          type: 'hosted',
          location: 'https://raw.githubusercontent.com/foo/bar/master/src/tsd.json'
        })
      })
    })

    describe('bitbucket', function () {
      it('should parse and append `tsd.json`', function () {
        expect(parseDependency('bitbucket:foo/bar')).to.deep.equal({
          raw: 'bitbucket:foo/bar',
          type: 'hosted',
          location: 'https://bitbucket.org/foo/bar/raw/master/tsd.json'
        })
      })

      it('should parse and append `tsd.json` to path', function () {
        expect(parseDependency('bitbucket:foo/bar/dir')).to.deep.equal({
          raw: 'bitbucket:foo/bar/dir',
          type: 'hosted',
          location: 'https://bitbucket.org/foo/bar/raw/master/dir/tsd.json'
        })
      })

      it('should parse with specified sha', function () {
        expect(parseDependency('bitbucket:foo/bar#abc')).to.deep.equal({
          raw: 'bitbucket:foo/bar#abc',
          type: 'hosted',
          location: 'https://bitbucket.org/foo/bar/raw/abc/tsd.json'
        })
      })
    })

    describe('url', function () {
      it('should parse', function () {
        expect(parseDependency('http://example.com/foo/tsd.json')).to.deep.equal({
          raw: 'http://example.com/foo/tsd.json',
          type: 'hosted',
          location: 'http://example.com/foo/tsd.json'
        })
      })
    })

    describe('unsupported', function () {
      it('should throw', function () {
        expect(() => parseDependency('random:fake/dep')).to.throw(/Unsupported dependency/)
      })
    })
  })
})
