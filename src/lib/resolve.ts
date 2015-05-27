import { join, dirname } from 'path'
import { stat, Stats } from 'fs-promise'

/**
 * Resolve the current `tsd.json` project.
 */
export function resolveTsdProject (dir: string): Promise<string> {
  return resolveTsdJson(dir).then(dirname)
}

/**
 * Resolve a `tsd.json` file.
 */
export function resolveTsdJson (dir: string): Promise<string> {
  return resolve(dir, 'tsd.json')
}

/**
 * Resolve a filename starting from the parent directory.
 */
export function resolveParent (dir: string, filename: string): Promise<string | void> {
  const parentDir = dirname(dir)

  if (dir === parentDir) {
    return Promise.reject(new Error('File not found: ' + filename))
  }

  return resolve(parentDir, filename)
}

/**
 * Recursively resolve a filename from the current directory.
 */
export function resolve (dir: string, filename: string): Promise<string> {
  const path = join(dir, filename)

  return stat(path)
    .then(function (res: typeof Stats) {
      if (res.isFile()) {
        return path
      }

      return resolveParent(dir, filename)
    })
    .catch(function (err: any) {
      if (err.code === 'ENOENT') {
        return resolveParent(dir, filename)
      }

      return Promise.reject(err)
    })
}
