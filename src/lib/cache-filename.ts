import { parse } from 'url'
import { join } from 'path'

/**
 * Based on https://github.com/npm/npm-cache-filename.
 */
export function url (root: string, url: string) {
  var parsedUrl = parse(url)

  var host = parsedUrl.host.replace(/:/g, '_')
  var parts = parsedUrl.path.split('/').slice(1).map(function (part) {
    return encodeURIComponent(part).replace(/%/g, '_')
  })

  return join.apply(null, [root, host].concat(parts))
}
