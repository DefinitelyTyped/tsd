/**
 * The expanded author specification for packages.
 */
export interface Author {
  name: string
  email?: string
  homepage?: string
}

/**
 * A dependency string is a string that maps to a resource. For example,
 * "file:foo/bar" or "npm:typescript".
 */
export type DependencyString = string

/**
 * The current `tsd.json` specification.
 */
export interface TsdJson {
  name?: string
  ambient?: boolean
  description?: string
  main?: string
  license?: string
  keywords?: string[]
  authors?: Array<string | Author>
  homepage?: string
  dependencies?: {
    [name: string]: DependencyString | DependencyString[]
  }
  devDependencies?: {
    [name: string]: DependencyString | DependencyString[]
  }
  ambientDependencies?: DependencyString[]
  ambientDevDependencies?: DependencyString[]
  resolutions?: {
    [name: string]: DependencyString
  }
}

/**
 * The old `tsd.json` specification, pre-0.7.0.
 */
export interface OldTsdJson {
  version?: string
  repo?: string
  ref?: string
  path?: string
  bundle?: string
  installed?: {
    [path: string]: {
      commit: string
    }
  }
}

/**
 * Specify a parsed dependency specification.
 */
export interface Dependency {
  type: string
  raw: string
  location: string
}

/**
 * Map of dependencies.
 */
export interface Dependencies {
  [name: string]: DependencyTree
}

/**
 * Used for generating the structure of a tree.
 */
export interface DependencyTree {
  name?: string
  path?: string
  parent?: DependencyTree
  type: string
  src: string
  originalSrc: string
  missing: boolean
  ambient: boolean
  dependencies: Dependencies
  devDependencies: Dependencies
  ambientDependencies: Array<DependencyTree>
  ambientDevDependencies: Array<DependencyTree>
}

/**
 * Used for creating the list of dependencies.
 */
export interface DependencyList {
  dependencies: Dependencies
  devDependencies: Dependencies
  ambientDependencies: Array<DependencyTree>
  ambientDevDependencies: Array<DependencyTree>
  missing: DependencyTree[]
  conflicts: {
    [name: string]: DependencyTree[]
  }
}
