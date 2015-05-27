import popsicle = require('popsicle')
import extend = require('xtend')
import sortKeys = require('sort-keys')
import { createHash } from 'crypto'
import { EOL } from 'os'
import { writeFile, readFile, stat } from 'fs-promise'
import { relative, dirname, join } from 'path'
import { parseDependency } from './lib/parse'
import { resolve, resolveTsdJson } from './lib/resolve'
import { TsdJson, Dependency } from './interfaces/tsd'
import { resolveDependencies } from './lib/dependencies'
import { extractReferences, toReference } from './lib/references'

/**
 * Location to write and store `.d.ts` files.
 */
const TSD_TYPINGS_DIR = 'tsd_typings'
const TSD_DEFINITIONS_NAME = 'tsd.d.ts'

/**
 * Install all defined dependencies.
 */
export function install (path: string) {
  return resolveDependencies(path)
    .then(function (dependencies: any) {
      const data = {
        missing: dependenciesToString(dependencies.missing),
        dependencies: dependenciesMapToString(dependencies.dependencies),
        devDependencies: dependenciesMapToString(dependencies.devDependencies),
        conflicts: dependenciesMapToString(dependencies.conflicts),
        ambientDependencies: dependenciesToString(dependencies.ambientDependencies),
        ambientDevDependencies: dependenciesToString(dependencies.ambientDevDependencies)
      }

      function dependenciesToString (deps: any) {
        return deps.map((dep: any) => dep && dep.path)
      }

      function dependenciesMapToString (deps: any) {
        const out: any = {}

        Object.keys(deps).forEach(function (key) {
          if (deps[key]) {
            out[key] = Array.isArray(deps[key]) ? dependenciesToString(deps[key]) : deps[key].path
          } else {
            out[key] = undefined
          }
        })

        return out
      }

      console.log(require('util').inspect(data, { depth: null }))
    })
}

/**
 * Map resolve functions to the type.
 */
interface DependencyTypeMap {
  [type: string]: (path: string, spec: Dependency) => Promise<string>
}

/**
 * Map of types that can be resolve to the functions.
 */
const DEPENDENCY_INSTALL_MAP: DependencyTypeMap = {
  'hosted': resolveHostedDependency,
  'bower': resolveBowerDependency,
  'npm': resolveNpmDependency,
  'file': resolveFileDependency
}

export interface InstallOptions {
  dev?: boolean
  name?: string
}

/**
 * Install and save a dependency.
 */
export function installAndSaveDependency (path: string, name: string, opts?: InstallOptions): Promise<Dependency> {
  return installDependency(path, name)
    .then(function (dependency) {
      return saveDependency(path, dependency, opts).then(() => dependency)
    })
}

/**
 * Save a dependency to `tsd.json`.
 */
export function saveDependency (path: string, spec: Dependency, opts?: InstallOptions): Promise<void> {
  return resolveTsdJson(path)
    .then(function (filename) {
      if (!filename) {
        return
      }

      return readFile(filename, 'utf8')
        .then(JSON.parse)
        .then(function (tsd) {
          if (opts.name) {
            const property = opts.dev ? 'devDependencies' : 'dependencies'

            tsd[property] = sortKeys(extend(tsd[property], {
              [opts.name]: spec.raw
            }))
          } else {
            const property = opts.dev ? 'ambientDevDependencies' : 'ambientDependencies'

            tsd[property] = (tsd[property] || []).concat(spec.raw).sort()
          }

          return writeFile(filename, JSON.stringify(tsd, null, 2))
        })
    })
}

/**
 * Install a dependency to a certain path.
 */
export function installDependency (path: string, name: string): Promise<Dependency> {
  let dependency: Dependency

  try {
    dependency = parseDependency(name)
  } catch (err) {
    return Promise.reject<Dependency>(err)
  }

  const handler = DEPENDENCY_INSTALL_MAP[dependency.type]
  const typingsDir = join(path, TSD_TYPINGS_DIR)

  return handler(typingsDir, dependency)
    .then<Dependency | void>(function (output: string) {
      if (!output) {
        return Promise.reject<Dependency>(new Error(`Could not resolve: ${name}`))
      }

      const typingsFile = join(typingsDir, TSD_DEFINITIONS_NAME)

      return readFile(typingsFile, 'utf8')
        .catch(function (err: any) {
          if (err.code === 'ENOENT') {
            return []
          }

          return Promise.reject(err)
        })
        .then(function (file: string) {
          const references = extractReferences(file)
            .map(function (reference) {
              return join(typingsDir, reference)
            })

          // Push the current dependency onto the end of the typings.
          if (references.indexOf(output) === -1) {
            references.push(output)
          }

          const typings = references
            .map(function (reference) {
              return toReference(relative(typingsDir, reference))
            })
            .join(EOL)

          return writeFile(typingsFile, typings).then(() => dependency)
        })
    })
}

/**
 * Resolve a hosted dependency (E.g. "https?").
 */
export function resolveHostedDependency (path: string, spec: Dependency) {
  return popsicle({
    url: spec.location,
    parse: false
  })
    .then(function (res: popsicle.Response) {
      const output = join(path, hash(spec))

      return writeFile(output, res.body).then(() => output)
    })
}

/**
 * Resolve a bower component.
 */
export function resolveBowerDependency (path: string, spec: Dependency) {
  return resolve(path, '.bowerrc')
    .then(function (bowerrcPath) {
      if (!bowerrcPath) {
        return resolve(path, join('bower_components', spec.location, 'bower.json'))
      }

      return readFile(bowerrcPath)
        .then(JSON.parse)
        .then(function (bowerrc: any) {
          return join(dirname(path), bowerrc.directory)
        })
        .then(function () {
          const bowerComponentPath = join(path, spec.location, 'bower.json')

          return stat(bowerComponentPath)
            .then(function (stat: any) {
              return stat.isFile() ? bowerComponentPath : undefined
            })
        })
    })
}

/**
 * Resolve a node module.
 */
export function resolveNpmDependency (path: string, spec: Dependency) {
  const npmPath = join('node_modules', spec.location, 'package.json')

  return resolve(path, npmPath).then(dirname)
}

/**
 * Resolve to the local filesystem.
 */
export function resolveFileDependency (path: string, spec: Dependency) {
  return Promise.resolve(join(path, spec.location))
}

/**
 * Hash the spec into an id to store locally on the filesystem.
 */
function hash (spec: Dependency): string {
  return createHash('md5')
    .update(`${spec.type}:${spec.location}`)
    .digest('hex')
}
