import extend = require('xtend')
import invariant = require('invariant')
import { resolve as resolveUrl } from 'url'
import { resolve, dirname } from 'path'
import { createHash } from 'crypto'
import { readFile, stat } from 'fs-promise'
import { resolve as resolveFile, resolveTsdProject } from './resolve'
import { parseDependency } from './parse'
import { Dependency, Dependencies, DependencyTree, TsdJson, DependencyList } from '../interfaces/tsd'
import { url as cacheUrlFilename } from './cache-filename'

/**
 * Default dependency config options.
 */
const DEFAULT_DEPENDENCY = <DependencyTree> {
  missing: false,
  ambient: undefined,
  dependencies: {},
  devDependencies: {},
  ambientDependencies: [],
  ambientDevDependencies: []
}

/**
 * Default configuration for a missing dependency.
 */
const MISSING_DEPENDENCY = <DependencyTree> extend(DEFAULT_DEPENDENCY, {
  missing: true
})

/**
 * Get the definition path from a `package.json`-like object.
 */
function getDefinition (path: string, packageJson: any) {
  const definition = packageJson.typescript && packageJson.typescript.definition

  return definition ? resolve(path, definition) : undefined
}

/**
 * Options for resolving dependencies.
 */
export interface Options {
  dev?: boolean
  cachePath?: string
}

/**
 * Get default options.
 */
function getOptions (path: string, opts?: Options): Options {
  return extend({
    dev: true,
    cachePath: resolve(path, 'tsd_typings/.cache')
  }, opts)
}

/**
 * Resolve all dependencies at the current path.
 */
export function resolveDependencies (path: string, opts: Options = {}) {
  return Promise.all([
    resolveTsdDependencies(path, opts),
    resolveNpmDependencies(path, opts),
    resolveBowerDependencies(path, opts)
  ])
    .then(mergeAndFlattenDependencies)
}

/**
 * Resolve a single dependency object.
 */
export function resolveDependency (path: string, dependency: Dependency, opts: Options = {}, parent?: DependencyTree) {
  const options = getOptions(path, opts)

  if (dependency.type === 'npm') {
    return resolveNpmDependency(path, dependency.location, options, parent)
  }

  if (dependency.type === 'bower') {
    return resolveBowerDependency(path, dependency.location, options, parent)
  }

  return resolveFileDependency(path, dependency.location, options, parent)
}

/**
 * Resolve a dependency in NPM.
 */
function resolveNpmDependency (path: string, name: string, opts: Options = {}, parent?: DependencyTree) {
  return resolveFile(path, `node_modules/${name}/package.json`)
    .then(function (modulePath: string) {
      return resolveNpmDependencyFrom(modulePath, opts, parent)
    })
}

/**
 * Resolve a dependency in Bower.
 */
function resolveBowerDependency (path: string, name: string, opts: Options = {}, parent?: DependencyTree) {
  return resolveBowerComponentPath(path)
    .then(function (componentPath: string) {
      const modulePath = resolve(componentPath, name, 'bower.json')

      return resolveBowerDependencyFrom(modulePath, componentPath, opts, parent)
    })
}

/**
 * Resolve a local file dependency.
 */
function resolveFileDependency (path: string, location: string, opts: Options = {}, parent?: DependencyTree): Promise<DependencyTree> {
  let src: string
  let originalSrc: string

  if (isHttp(location)) {
    originalSrc = location
    src = cacheUrlFilename(opts.cachePath, originalSrc)
  } else if (parent && parent.type === 'tsd' && isHttp(parent.originalSrc)) {
    originalSrc = resolveUrl(parent.originalSrc, location)
    src = cacheUrlFilename(opts.cachePath, originalSrc)
  } else {
    originalSrc = src = resolve(path, location)
  }

  if (!isDefinition(src)) {
    return resolveTsdDependencyFrom(src, opts, parent, originalSrc)
  }

  return stat(src)
    .then(function (stats) {
      if (!stats.isFile()) {
        return Promise.reject<DependencyTree>(new Error('Not a valid file'))
      }

      return <DependencyTree> extend(DEFAULT_DEPENDENCY, {
        type: 'tsd',
        name: undefined,
        src: src,
        originalSrc: originalSrc,
        path: src,
        parent: parent
      })
    })
    .catch(function () {
      return <DependencyTree> extend(MISSING_DEPENDENCY, {
        type: 'tsd',
        name: undefined,
        src: src,
        originalSrc: originalSrc,
        path: src,
        parent: parent
      })
    })
}

/**
 * Follow and resolve bower dependencies.
 */
export function resolveBowerDependencies (path: string, opts: Options = {}): Promise<DependencyTree | void> {
  const options = getOptions(path, opts)

  return resolveFile(path, 'bower.json')
    .then(
      function (bowerJsonPath: string) {
        return resolveBowerComponentPath(dirname(bowerJsonPath))
          .then(function (componentPath: string) {
            return resolveBowerDependencyFrom(bowerJsonPath, componentPath, options)
          })
      },
      function () {
        return undefined
      }
    )
}

/**
 * Resolve bower dependencies from a path.
 */
function resolveBowerDependencyFrom (filename: string, componentPath: string, opts: Options = {}, parent?: DependencyTree): Promise<DependencyTree> {
  checkCircularDependency(parent, filename)

  return readJson(filename)
    .then(
      function (bowerJson: any = {}) {
        const path = dirname(filename)

        const tree = <DependencyTree> extend(DEFAULT_DEPENDENCY, {
          name: bowerJson.name,
          src: filename,
          originalSrc: filename,
          path: getDefinition(path, bowerJson),
          type: 'bower',
          parent: parent,
          ambient: false
        })

        const dependencyMap = extend(bowerJson.dependencies)
        const devDependencyMap = extend(opts.dev ? bowerJson.devDependencies : {})

        return Promise.all([
          resolveBowerDependencyMap(componentPath, dependencyMap, opts, tree),
          resolveBowerDependencyMap(componentPath, devDependencyMap, opts, tree)
        ])
          .then(function ([dependencies, devDependencies]) {
            tree.dependencies = dependencies
            tree.devDependencies = devDependencies

            return tree
          })
      },
      function () {
        return <DependencyTree> extend(MISSING_DEPENDENCY, {
          parent: parent,
          type: 'bower',
          originalSrc: filename,
          src: filename
        })
      }
    )
}

/**
 * Resolve the path to bower components.
 */
function resolveBowerComponentPath (path: string): Promise<string> {
  return readFile(resolve(path, '.bowerrc'), 'utf8')
    .then(JSON.parse)
    .then(function (bowerrc: any = {}) {
      return resolve(path, bowerrc.directory || 'bower_components')
    })
    .catch(function () {
      return resolve(path, 'bower_components')
    })
}

/**
 * Recursively resolve dependencies from a list and component path.
 */
function resolveBowerDependencyMap (componentPath: string, dependencies: any, opts: Options, parent: DependencyTree): Promise<Dependencies> {
  const keys = Object.keys(dependencies)

  return Promise.all(keys.map(function (name) {
    const modulePath = resolve(componentPath, name, 'bower.json')

    return resolveBowerDependencyFrom(modulePath, componentPath, extend(opts, { dev: false }), parent)
  }))
    .then(function (deps: DependencyTree[]) {
      return object(keys, deps)
    })
}

/**
 * Follow and resolve npm dependencies.
 */
export function resolveNpmDependencies (path: string, opts: Options = {}): Promise<DependencyTree | void> {
  const options = getOptions(path, opts)

  return resolveFile(path, 'package.json')
    .then(
      function (packgeJsonPath: string) {
        return resolveNpmDependencyFrom(packgeJsonPath, options)
      },
      function () {
        return undefined
      }
    )
}

/**
 * Resolve NPM dependencies from `package.json`.
 */
function resolveNpmDependencyFrom (filename: string, opts: Options = {}, parent?: DependencyTree): Promise<DependencyTree> {
  checkCircularDependency(parent, filename)

  return readJson(filename)
    .then(function (packageJson: any = {}) {
      const path = dirname(filename)

      const tree = <DependencyTree> extend(DEFAULT_DEPENDENCY, {
        name: packageJson.name,
        src: filename,
        originalSrc: filename,
        path: getDefinition(path, packageJson),
        parent: parent,
        type: 'npm',
        ambient: false
      })

      const dependencyList = extend(
        packageJson.dependencies,
        packageJson.peerDependencies,
        packageJson.optionalDependencies
      )

      const devDependencyList = extend(opts.dev ? packageJson.devDependencies : {})

      return Promise.all([
        resolveNpmDependencyMap(path, dependencyList, opts, tree),
        resolveNpmDependencyMap(path, devDependencyList, opts, tree)
      ])
        .then(function ([dependencies, devDependencies]) {
          tree.dependencies = dependencies
          tree.devDependencies = devDependencies

          return tree
        })
    })
    .catch(function () {
      return <DependencyTree> extend(MISSING_DEPENDENCY, {
        parent: parent,
        type: 'npm',
        originalSrc: filename,
        src: filename
      })
    })
}

/**
 * Recursively resolve dependencies from a list and component path.
 */
function resolveNpmDependencyMap (path: string, dependencies: any, opts: Options, parent: DependencyTree) {
  var keys = Object.keys(dependencies)

  return Promise.all(keys.map(function (name) {
    return resolveNpmDependency(path, name, extend(opts, { dev: false }), parent)
  }))
    .then(function (deps: DependencyTree[]) {
      return object(keys, deps)
    })
}

/**
 * Follow and resolve TSD dependencies.
 */
export function resolveTsdDependencies (path: string, opts: Options = {}): Promise<DependencyTree | void> {
  const options = getOptions(path, opts)

  return resolveFile(path, 'tsd.json')
    .then(
      function (tsdJsonPath: string) {
        return resolveTsdDependencyFrom(tsdJsonPath, options)
      },
      function () {
        return undefined
      }
    )
}

/**
 * Resolve TSD dependencies from an exact path.
 */
function resolveTsdDependencyFrom (filename: string, opts: Options = {}, parent?: DependencyTree, orginalSrc?: string) {
  checkCircularDependency(parent, filename)

  return readJson(filename)
    .then(function (tsdJson: TsdJson) {
      const path = dirname(filename)

      const tree = <DependencyTree> extend(DEFAULT_DEPENDENCY, {
        name: tsdJson.name,
        src: filename,
        originalSrc: orginalSrc || filename,
        ambient: !!tsdJson.ambient,
        path: tsdJson.main ? resolve(path, tsdJson.main) : undefined,
        parent: parent,
        type: 'tsd'
      })

      const dependencyMap = extend(tsdJson.dependencies)
      const devDependencyMap = extend(opts.dev ? tsdJson.devDependencies : {})
      const ambientDependencyMap = array(tsdJson.ambientDependencies)
      const ambientDevDependencyMap = opts.dev ? array(tsdJson.ambientDevDependencies) : []

      return Promise.all<any>([
        resolveTsdDependencyMap(path, dependencyMap, opts, tree),
        resolveTsdDependencyMap(path, devDependencyMap, opts, tree),
        resolveTsdDependencyArray(path, ambientDependencyMap, opts, tree),
        resolveTsdDependencyArray(path, ambientDevDependencyMap, opts, tree)
      ])
        .then(function ([dependencies, devDependencies, ambientDependencies, ambientDevDependencies]) {
          tree.dependencies = dependencies
          tree.devDependencies = devDependencies
          tree.ambientDependencies = ambientDependencies
          tree.ambientDevDependencies = ambientDevDependencies

          return tree
        })
    }, function () {
      return extend(MISSING_DEPENDENCY, {
        parent: parent,
        type: 'tsd',
        src: filename,
        originalSrc: orginalSrc || filename
      })
    })
}

/**
 * Resolve an array of TSD dependencies. This logic is much simpler than the map of arrays or values.
 */
function resolveTsdDependencyArray (path: string, dependencies: string[], opts: Options, parent: DependencyTree): Promise<DependencyTree[]> {
  return Promise.all(dependencies.map(function (dependency) {
    return resolveDependency(path, parseDependency(dependency), extend(opts, { dev: false }), parent)
  }))
}

/**
 * Resolve TSD dependency map from a cache directory.
 */
function resolveTsdDependencyMap (path: string, dependencies: any, opts: Options, parent: DependencyTree) {
  const keys = Object.keys(dependencies)

  return Promise.all(keys.map(function (name) {
    // Map over the dependency list and resolve to the first found dependency.
    return array(dependencies[name])
      .map((str) => parseDependency(str))
      .reduce(function (result: Promise<DependencyTree>, dependency: Dependency) {
        return result.then(function (tree) {
          // Continue trying to resolve if the dependency is missing.
          if (tree.missing) {
            return resolveDependency(path, dependency, extend(opts, { dev: false }), parent)
          }

          return tree
        })
      }, Promise.resolve(MISSING_DEPENDENCY))
  }))
    .then(function (deps: DependencyTree[]) {
      return object(keys, deps)
    })
}

/**
 * Read a file as JSON and fail gracefully.
 */
function readJson (filename: string): any {
  return readFile(filename, 'utf8')
    .then(Function.prototype.call.bind(String.prototype.trim))
    .then(JSON.parse)
}

/**
 * Create an object from an array of keys and values.
 */
function object <T> (keys: string[], values: T[]): { [key: string]: T } {
  const dest: { [key: string]: T } = {}

  keys.forEach(function (key: string, index: number) {
    dest[key] = values[index]
  })

  return dest
}

/**
 * Check if a file is a definition.
 */
function isDefinition (filename: string): boolean {
  return /\.d\.ts$/.test(filename)
}

/**
 * Ensure a value is an array.
 */
function array <T> (value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return <T[]> value
  }

  return <T[]> (value == null ? [] : [value])
}

/**
 * Check whether the filename is a circular dependency.
 */
function checkCircularDependency (tree: DependencyTree, filename: string) {
  if (tree) {
    const currentSrc = tree.src

    do {
      invariant(tree.src !== filename, 'Circular dependency detected in %s', currentSrc)
    } while (tree = tree.parent)
  }
}

/**
 * Check if a string is a URL.
 */
function isHttp (url: string) {
  return /^https?\:/i.test(url)
}

/**
 * Check if a property is set.
 */
function hasProperty (obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
 * Merge dependency trees together.
 */
function mergeAndFlattenDependencies (dependencies: DependencyTree[]): DependencyList {
  const list: DependencyList = {
    dependencies: {},
    devDependencies: {},
    ambientDependencies: [],
    ambientDevDependencies: [],
    missing: [],
    conflicts: {}
  }

  // Quickly check for conflicts.
  const exists: { [name: string]: boolean } = {}

  /**
   * Add a dependency to the flattened list.
   */
  function add (dev: boolean, name: string, dependency: DependencyTree, root?: boolean) {
    // Push all missing files into a list.
    // TODO: Come back to this logic.
    if (dependency.missing) {
      list.missing.push(dependency)
    }

    // Ignore dependencies missing a path.
    if (!dependency.path) {
      return
    }

    // Check if it's already added. TSD dependencies override others at the root.
    if (hasProperty(exists, name) && (!root && dependency.type !== 'tsd')) {
      if (hasProperty(list.dependencies, name)) {
        list.conflicts[name] = [list.dependencies[name]]
        list.dependencies[name] = undefined
      }

      if (hasProperty(list.devDependencies, name)) {
        list.conflicts[name] = [list.devDependencies[name]]
        list.devDependencies[name] = undefined
      }

      list.conflicts[name].push(dependency)

      return
    }

    exists[name] = true

    if (!dev) {
      list.dependencies[name] = dependency
    } else {
      list.devDependencies[name] = dependency
    }
  }

  /**
   * Recursively flatten dependency trees.
   */
  function flatten (dependency: DependencyTree) {
    if (!dependency) {
      return
    }

    Object.keys(dependency.dependencies).forEach(function (key) {
      add(false, key, dependency.dependencies[key])
      flatten(dependency.dependencies[key])
    })

    Object.keys(dependency.devDependencies).forEach(function (key) {
      add(true, key, dependency.devDependencies[key])
      flatten(dependency.devDependencies[key])
    })
  }

  // Kick start resolution from the root. Each tree is greatly simplified and
  // can navigate a much simpler path as children will only have one source.
  dependencies.forEach(function (dependency: DependencyTree) {
    // Tree may be undefined when it does not exist.
    if (!dependency) {
      return
    }

    // TODO: TSD dependencies take priority and don't conflict.
    Object.keys(dependency.dependencies).forEach(function (key) {
      add(false, key, dependency.dependencies[key], true)
    })

    Object.keys(dependency.devDependencies).forEach(function (key) {
      add(true, key, dependency.devDependencies[key], true)
    })

    // Just merge all ambient dependencies.
    // TODO: Less naive logic.
    Array.prototype.push.apply(list.ambientDependencies, dependency.ambientDependencies)
    Array.prototype.push.apply(list.ambientDevDependencies, dependency.ambientDevDependencies)
  })

  // Handle supported dependencies and resolve repeadedly.
  Object.keys(list.dependencies).forEach(function (key) {
    flatten(list.dependencies[key])
  })

  Object.keys(list.devDependencies).forEach(function (key) {
    flatten(list.devDependencies[key])
  })

  return list
}
