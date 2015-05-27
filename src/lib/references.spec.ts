import { expect } from 'chai'
import { extractReferences, toReference, removeReference, addReference } from './references'

describe('references', function () {
  it('should parse references from string', function () {
    expect(extractReferences([
      '/// <reference path="foobar.d.ts" />',
      '',
      '///\t<reference\t path="example.d.ts"/>'
    ].join('\n'))).to.deep.equal([
      {
        start: 0,
        end: 37,
        path: 'foobar.d.ts'
      },
      {
        start: 38,
        end: 75,
        path: 'example.d.ts'
      }
    ])
  })

  it('should compile a path to a reference string', function () {
    expect(toReference('foobar.d.ts')).to.equal('/// <reference path="foobar.d.ts" />')
  })

  it('should remove a reference', function () {
    expect(removeReference([
      '  ///<reference\tpath="foobar.d.ts" />  ',
      '/// <reference path="example.d.ts" />'
    ].join('\n'), 'foobar.d.ts')).to.equal('/// <reference path="example.d.ts" />')
  })

  it('should add a reference', function () {
    expect(addReference(
      '/// <reference path="foobar.d.ts" />',
      'example.d.ts'
    )).to.equal('/// <reference path="foobar.d.ts" />\n/// <reference path="example.d.ts" />\n')
  })
})
