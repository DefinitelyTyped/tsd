import { join } from 'path'
import { writeFile, readFile } from 'fs-promise'
import { resolveTsdJson } from './lib/resolve'
import { TsdJson, OldTsdJson } from './interfaces/tsd'

/**
 * Create a new `tsd.json` file for the user, making sure not to override
 * any existing file.
 */
export function create (path: string): Promise<void> {
  return resolveTsdJson(path)
    .then(function (tsdPath) {
      if (!tsdPath) {
        const data = JSON.stringify(generate(), null, 2)
        const filename = join(path, 'tsd.json')

        return writeFile(filename, data)
      }

      return Promise.reject(new Error('TSD has already been initialised'))
    })
}

/**
 * Generate a simple framework for `tsd.json`.
 */
export function generate (): TsdJson {
  return {
    main: '',
    dependencies: {},
    devDependencies: {}
  }
}

/**
 * Look up keys that exist on the new format.
 */
const tsdJsonKeys: { [property: string]: boolean } = {
  description: true,
  main: true,
  homepage: true,
  dependencies: true,
  devDependencies: true,
  ambientDependencies: true,
  ambientDevDependencies: true,
  resolutions: true
}

/**
 * Update an old `tsd.json` format to the new format.
 */
export function upgradeTsdJson (oldTsdJson: OldTsdJson): TsdJson {
  const tsdJson: TsdJson = {}
  const maybeNewTsdJson = Object.keys(oldTsdJson).some(key => tsdJsonKeys[key])

  if (maybeNewTsdJson) {
    throw new Error('TSD is already up to date')
  }

  const repo = oldTsdJson.repo || 'borisyankov/DefinitelyTyped'

  // Copy all installed modules to ambient dependencies.
  if (oldTsdJson.installed) {
    tsdJson.ambientDependencies = []

    Object.keys(oldTsdJson.installed).forEach(function (path) {
      const dependency = oldTsdJson.installed[path]

      tsdJson.ambientDependencies.push(`github:${repo}/${path}#${dependency.commit}`)
    })
  }

  return tsdJson
}

/**
 * Search for and upgrade a `tsd.json` specification to the latest format.
 */
export function upgrade (path: string): Promise<void> {
  return resolveTsdJson(path)
    .then(function (path: string) {
      if (!path) {
        return Promise.reject(new Error('No `tsd.json` found'))
      }

      return readFile(path, 'utf8')
        .then(JSON.parse)
        .then(upgradeTsdJson)
        .then(function (tsdJson: TsdJson) {
          return writeFile(path, JSON.stringify(tsdJson, null, 2))
        })
    })
}
