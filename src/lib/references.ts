import { EOL } from 'os'

/**
 * Match reference tags in a file. Matching the newline before the
 * reference to remove unwanted data when removing the line from the file.
 */
const REFERENCE_REGEXP = /[ \t]*\/\/\/[ \t]*<reference[ \t]+path=(["'])([^'"]*)\1[ \t]*\/>[ \t]*\r?\n?/gm

/**
 * References come back in a semi-useful structure to enable slicing them
 * from the source code that was passed in.
 */
export interface Reference {
  start: number
  end: number
  path: string
}

/**
 * Extract all references from a file.
 */
export function extractReferences (contents: string): Reference[] {
  const refs: Reference[] = []
  let m: any

  while ((m = REFERENCE_REGEXP.exec(contents)) != null) {
    refs.push({
      start: m.index,
      end: m.index + m[0].length,
      path: m[2]
    })
  }

  return refs
}

export function removeReference (contents: string, path: string): string {
  const references = extractReferences(contents)

  references.forEach(function (reference) {
    if (reference.path === path) {
      contents = contents.substr(0, reference.start) + contents.substr(reference.end)
    }
  })

  return contents
}

export function addReference (contents: string, path: string): string {
  const references = extractReferences(contents)
  const hasReference = references.some((x) => x.path === path)

  if (!hasReference) {
    if (!/\r?\n$/.test(contents)) {
      contents += EOL
    }

    contents += toReference(path) + EOL
  }

  return contents
}

/**
 * Return a path as a reference string.
 */
export function toReference (path: string): string {
  return `/// <reference path="${encodeURIComponent(path)}" />`
}
