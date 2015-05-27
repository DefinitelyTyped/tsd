import { expect } from 'chai'
import { join } from 'path'
import proxyquire = require('proxyquire')
import * as Dependencies from './dependencies'
import { DependencyTree } from '../interfaces/tsd'

describe.only('dependencies', function () {
  describe('bower', function () {
    it('should resolve a dependency tree', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'bower.json')) {
              return Promise.resolve(`
                {
                  "name": "foobar",
                  "dependencies": {
                    "dep": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'bower_components/dep/bower.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "typescript": {
                    "definition": "dep.d.ts"
                  },
                  "dependencies": {
                    "example": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'bower_components/example/bower.json')) {
              return Promise.resolve('{"name":"example"}')
            }

            return Promise.reject(new Error('No file exists'))
          }
        }
      })

      return dependencies.resolveBowerDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: 'foobar',
            src: join(__dirname, 'bower.json'),
            originalSrc: join(__dirname, 'bower.json'),
            type: 'bower',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: 'dep',
            src: join(__dirname, 'bower_components/dep/bower.json'),
            originalSrc: join(__dirname, 'bower_components/dep/bower.json'),
            type: 'bower',
            ambient: false,
            missing: false,
            path: join(__dirname, 'bower_components/dep/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: 'example',
            src: join(__dirname, 'bower_components/example/bower.json'),
            originalSrc: join(__dirname, 'bower_components/example/bower.json'),
            type: 'bower',
            ambient: false,
            missing: false,
            path: undefined,
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should detect circular dependencies', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'bower.json')) {
              return Promise.resolve(`
                {
                  "name": "foobar",
                  "dependencies": {
                    "dep": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'bower_components/dep/bower.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "typescript": {
                    "definition": "dep.d.ts"
                  },
                  "dependencies": {
                    "example": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'bower_components/example/bower.json')) {
              return Promise.resolve(`
                {
                  "name": "example",
                  "dependencies": {
                    "dep": "*"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists'))
          }
        }
      })

      return expect(
        dependencies.resolveBowerDependencies(__dirname)
      ).to.eventually.be.rejectedWith(`Invariant Violation: Circular dependency detected in ${join(__dirname, 'bower_components/example/bower.json')}`)
    })
  })

  describe('npm', function () {
    it('should resolve a dependency tree', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'package.json')) {
              return Promise.resolve(`
                {
                  "name": "foobar",
                  "dependencies": {
                    "dep": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'node_modules/dep/package.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "typescript": {
                    "definition": "dep.d.ts"
                  },
                  "dependencies": {
                    "example": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'node_modules/dep/node_modules/example/package.json')) {
              return Promise.resolve('{"name":"example"}')
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      return dependencies.resolveNpmDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: 'foobar',
            src: join(__dirname, 'package.json'),
            originalSrc: join(__dirname, 'package.json'),
            type: 'npm',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: 'dep',
            src: join(__dirname, 'node_modules/dep/package.json'),
            originalSrc: join(__dirname, 'node_modules/dep/package.json'),
            type: 'npm',
            ambient: false,
            missing: false,
            path: join(__dirname, 'node_modules/dep/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: 'example',
            src: join(__dirname, 'node_modules/dep/node_modules/example/package.json'),
            originalSrc: join(__dirname, 'node_modules/dep/node_modules/example/package.json'),
            type: 'npm',
            ambient: false,
            missing: false,
            path: undefined,
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should resolve dependency to missing when not installed', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'package.json')) {
              return Promise.resolve(`
                {
                  "name": "foobar",
                  "dependencies": {
                    "dep": "*"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      const foobar: DependencyTree = {
        name: 'foobar',
        src: join(__dirname, 'package.json'),
        originalSrc: join(__dirname, 'package.json'),
        type: 'npm',
        ambient: false,
        missing: false,
        path: undefined,
        parent: undefined,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: [],
        ambientDevDependencies: []
      }

      const dep: DependencyTree = {
        ambient: undefined,
        ambientDependencies: [],
        ambientDevDependencies: [],
        dependencies: {},
        devDependencies: {},
        missing: true,
        originalSrc: join(__dirname, 'node_modules/dep/package.json'),
        parent: foobar,
        src: join(__dirname, 'node_modules/dep/package.json'),
        type: 'npm'
      }

      ;(<any> foobar).dependencies.dep = dep

      return expect(
        dependencies.resolveNpmDependencies(__dirname)
      ).to.eventually.deep.equal(foobar)
    })
  })

  describe('tsd', function () {
    it('should resolve a dependency tree', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          stat (filename: string) {
            return Promise.resolve({
              isFile () { return true }
            })
          },
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "name": "foobar",
                  "dependencies": {
                    "dep": "file:dep/tsd.json"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'dep/tsd.json')) {
              return Promise.resolve(`
                {
                  "main": "dep.d.ts",
                  "dependencies": {
                    "example": "file:example/example.d.ts"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'dep/example/example.d.ts')) {
              return Promise.resolve('')
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      return dependencies.resolveTsdDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: 'foobar',
            src: join(__dirname, 'tsd.json'),
            originalSrc: join(__dirname, 'tsd.json'),
            type: 'tsd',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'dep/tsd.json'),
            originalSrc: join(__dirname, 'dep/tsd.json'),
            type: 'tsd',
            ambient: false,
            missing: false,
            path: join(__dirname, 'dep/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'dep/example/example.d.ts'),
            originalSrc: join(__dirname, 'dep/example/example.d.ts'),
            type: 'tsd',
            ambient: undefined,
            missing: false,
            path: join(__dirname, 'dep/example/example.d.ts'),
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should resolve to npm modules', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "dependencies": {
                    "dep": "npm:dep"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'node_modules/dep/package.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "typescript": {
                    "definition": "dep.d.ts"
                  },
                  "dependencies": {
                    "example": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'node_modules/dep/node_modules/example/package.json')) {
              return Promise.resolve(`
                {
                  "name": "example",
                  "typescript": {
                    "definition": "example.d.ts"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      return dependencies.resolveTsdDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'tsd.json'),
            originalSrc: join(__dirname, 'tsd.json'),
            type: 'tsd',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: 'dep',
            src: join(__dirname, 'node_modules/dep/package.json'),
            originalSrc: join(__dirname, 'node_modules/dep/package.json'),
            type: 'npm',
            ambient: false,
            missing: false,
            path: join(__dirname, 'node_modules/dep/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: 'example',
            src: join(__dirname, 'node_modules/dep/node_modules/example/package.json'),
            originalSrc: join(__dirname, 'node_modules/dep/node_modules/example/package.json'),
            type: 'npm',
            ambient: false,
            missing: false,
            path: join(__dirname, 'node_modules/dep/node_modules/example/example.d.ts'),
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should resolve to bower modules', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "dependencies": {
                    "dep": "bower:dep"
                  }
                }
              `)
            }

            if (filename === join(__dirname, '.bowerrc')) {
              return Promise.resolve(`
                {
                  "directory": "public/bower_components"
                }
              `)
            }

            if (filename === join(__dirname, 'public/bower_components/dep/bower.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "typescript": {
                    "definition": "dep.d.ts"
                  },
                  "dependencies": {
                    "example": "*"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'public/bower_components/example/bower.json')) {
              return Promise.resolve(`
                {
                  "name": "example",
                  "typescript": {
                    "definition": "example.d.ts"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      return dependencies.resolveTsdDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'tsd.json'),
            originalSrc: join(__dirname, 'tsd.json'),
            type: 'tsd',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: 'dep',
            src: join(__dirname, 'public/bower_components/dep/bower.json'),
            originalSrc: join(__dirname, 'public/bower_components/dep/bower.json'),
            type: 'bower',
            ambient: false,
            missing: false,
            path: join(__dirname, 'public/bower_components/dep/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: 'example',
            src: join(__dirname, 'public/bower_components/example/bower.json'),
            originalSrc: join(__dirname, 'public/bower_components/example/bower.json'),
            type: 'bower',
            ambient: false,
            missing: false,
            path: join(__dirname, 'public/bower_components/example/example.d.ts'),
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should resolve hosted dependencies locally', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {stat (filename: string) {
            return Promise.resolve({
              isFile () { return true }
            })
          },
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "dependencies": {
                    "dep": "github:blakeembrey/dep"
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/tsd.json')) {
              return Promise.resolve(`
                {
                  "main": "dep.d.ts",
                  "dependencies": {
                    "example": "file:./typings/example.d.ts"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      return dependencies.resolveTsdDependencies(__dirname)
        .then(function (result) {
          const foobar: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'tsd.json'),
            originalSrc: join(__dirname, 'tsd.json'),
            type: 'tsd',
            ambient: false,
            missing: false,
            path: undefined,
            parent: undefined,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const dep: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/tsd.json'),
            originalSrc: 'https://raw.githubusercontent.com/blakeembrey/dep/master/tsd.json',
            type: 'tsd',
            ambient: false,
            missing: false,
            path: join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/dep.d.ts'),
            parent: foobar,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          const example: DependencyTree = {
            name: undefined,
            src: join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/typings/example.d.ts'),
            originalSrc: 'https://raw.githubusercontent.com/blakeembrey/dep/master/typings/example.d.ts',
            type: 'tsd',
            ambient: undefined,
            missing: false,
            path: join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/typings/example.d.ts'),
            parent: dep,
            dependencies: {},
            devDependencies: {},
            ambientDependencies: [],
            ambientDevDependencies: []
          }

          ;(<any> foobar.dependencies).dep = dep
          ;(<any> dep.dependencies).example = example

          expect(result).to.deep.equal(foobar)
        })
    })

    it('should set uninstalled dependencies as missing', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "dependencies": {
                    "dep": "github:blakeembrey/dep"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      const foobar: DependencyTree = {
        name: undefined,
        src: join(__dirname, 'tsd.json'),
        originalSrc: join(__dirname, 'tsd.json'),
        type: 'tsd',
        ambient: false,
        missing: false,
        path: undefined,
        parent: undefined,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: [],
        ambientDevDependencies: []
      }

      const dep: DependencyTree = {
        src: join(__dirname, 'tsd_typings/.cache/raw.githubusercontent.com/blakeembrey/dep/master/tsd.json'),
        originalSrc: 'https://raw.githubusercontent.com/blakeembrey/dep/master/tsd.json',
        type: 'tsd',
        ambient: undefined,
        missing: true,
        parent: foobar,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: [],
        ambientDevDependencies: []
      }

      ;(<any> foobar.dependencies).dep = dep

      return expect(
        dependencies.resolveTsdDependencies(__dirname)
      ).to.eventually.deep.equal(foobar)
    })

    it('should resolve the first found dependency', function () {
      const dependencies = <typeof Dependencies> proxyquire('./dependencies', {
        './resolve': {
          resolve (path: string, name: string) {
            return Promise.resolve(join(path, name))
          }
        },
        'fs-promise': {
          readFile (filename: string): Promise<void | string> {
            if (filename === join(__dirname, 'tsd.json')) {
              return Promise.resolve(`
                {
                  "dependencies": {
                    "dep": [
                      "bower:dep",
                      "npm:dep",
                      "github:blakeembrey/dep"
                    ]
                  }
                }
              `)
            }

            if (filename === join(__dirname, 'node_modules/dep/package.json')) {
              return Promise.resolve(`
                {
                  "name": "dep",
                  "main": "main.js",
                  "typescript": {
                    "definition": "typings/main.d.ts"
                  }
                }
              `)
            }

            return Promise.reject(new Error('No file exists: ' + filename))
          }
        }
      })

      const foobar: DependencyTree = {
        name: undefined,
        src: join(__dirname, 'tsd.json'),
        originalSrc: join(__dirname, 'tsd.json'),
        type: 'tsd',
        ambient: false,
        missing: false,
        path: undefined,
        parent: undefined,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: [],
        ambientDevDependencies: []
      }

      const dep: DependencyTree = {
        src: join(__dirname, 'node_modules/dep/package.json'),
        originalSrc: join(__dirname, 'node_modules/dep/package.json'),
        path: join(__dirname, 'node_modules/dep/typings/main.d.ts'),
        type: 'npm',
        name: 'dep',
        ambient: false,
        missing: false,
        parent: foobar,
        dependencies: {},
        devDependencies: {},
        ambientDependencies: [],
        ambientDevDependencies: []
      }

      ;(<any> foobar.dependencies).dep = dep

      return expect(
        dependencies.resolveTsdDependencies(__dirname)
      ).to.eventually.deep.equal(foobar)
    })
  })

  describe('combined', function () {

  })
})
