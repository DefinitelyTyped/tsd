import * as tsdInit from './init'
import * as tsdInstall from './install'

export var create = tsdInit.create
export var upgrade = tsdInit.upgrade
export var install = tsdInstall.install
export var installDependency = tsdInstall.installDependency
export var installAndSaveDependency = tsdInstall.installAndSaveDependency
