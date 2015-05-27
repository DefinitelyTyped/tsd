import { parse, format } from 'url'
import { normalize, basename } from 'path'
import { Dependency } from '../interfaces/tsd'

/**
 * Return default git options from the pathname.
 */
function gitFromPathname (pathname: string): { repo: string; path: string } {
  const segments = pathname.substr(1).split('/')
  const repo = segments.shift()
  let path = segments.join('/')

  if (segments.length === 0) {
    path = 'tsd.json'
  } else if (!/\.d\.ts$|(?:^|\/)tsd.json$/.test(path)) {
    path += '/tsd.json'
  }

  return { repo, path }
}

/**
 * Extract the sha or default to `master`.
 */
function shaFromHash (hash: string): string {
  return hash ? hash.substr(1) : 'master'
}

/**
 * Parse a `tsd.json` dependency field.
 */
export function parseDependency (raw: string): Dependency {
  const parsedurl = parse(raw)
  const { protocol, auth, hostname, pathname, hash } = parsedurl

  if (protocol === 'file:') {
    const location = normalize(pathname)
    const filename = basename(location)

    if (!/\.d\.ts$|^tsd\.json$/.test(filename)) {
      throw new TypeError('Only `.d.ts` files and `tsd.json` is supported')
    }

    return {
      raw,
      type: 'file',
      location
    }
  }

  if (protocol === 'github:') {
    const sha = shaFromHash(hash)
    const { repo, path } = gitFromPathname(pathname)

    return {
      raw,
      type: 'hosted',
      location: `https://raw.githubusercontent.com/${hostname}/${repo}/${sha}/${path}`
    }
  }

  if (protocol === 'bitbucket:') {
    const sha = shaFromHash(hash)
    const { repo, path } = gitFromPathname(pathname)

    return {
      raw,
      type: 'hosted',
      location: `https://bitbucket.org/${hostname}/${repo}/raw/${sha}/${path}`
    }
  }

  if (protocol === 'npm:' || protocol === 'bower:') {
    return {
      raw,
      type: protocol === 'npm:' ? 'npm' : 'bower',
      location: auth === '' ? `@${hostname}${pathname}` : hostname
    }
  }

  if (protocol === 'http:' || protocol === 'https:') {
    return {
      raw,
      type: 'hosted',
      location: format(parsedurl)
    }
  }

  throw new TypeError(`Unsupported dependency: ${raw}`)
}
