///<reference path="_ref.ts" />
///<reference path="../src/xm/io/FileUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />
///<reference path="../src/xm/data/PackageJSON.ts" />
///<reference path="../src/tsd/context/Const.ts" />
///<reference path="../src/tsd/data/Def.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert:chai.Assert = require('chai').assert;
	var q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	export var configSchema = xm.FileUtil.readJSONSync('./schema/tsd-config_v4.json');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function pad(num:number, len:number):string {
		var ret = num.toString(10);
		while (ret.length < len) {
			ret = '0' + ret;
		}
		return ret;
	}

	export function getCacheDir():string {
		return path.join(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
	}

	export function getContext() {
		var context:tsd.Context;
		context = new tsd.Context();
		context.paths.cacheDir = getCacheDir();
		return context;
	}

	export interface TempInfo {
		name: string;
		tmpDir: string;
		configFile: string;
		typingsDir: string;
		dataCopyFile: string;
		selectorDumpFile: string;
	}

	export function getTempInfo(message:string, index:number, createFile:bool):TempInfo {

		var name = pad(index, 3);
		var tmpDir = path.resolve(__dirname, message, name);
		xm.mkdirCheckSync(tmpDir, true);

		var info:TempInfo = {
			name: name,
			tmpDir: tmpDir,
			configFile: path.resolve(tmpDir, 'tsd-config.json'),
			typingsDir: path.resolve(tmpDir, 'typings'),
			dataCopyFile: path.resolve(tmpDir, 'data-dump.json'),
			selectorDumpFile: path.resolve(tmpDir, 'selector-dump.json')
		};

		if (createFile) {
			fs.writeFileSync(info.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
		}
		return info;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertConfig(config:tsd.Config, values:any, message:string) {
		assert.ok(config, message + ' config');
		assert.ok(values, message + ' values');
		assert.instanceOf(config, tsd.Config, message + ' config');

		propStrictEqual(config, values, 'typingsPath', message);
		propStrictEqual(config, values, 'version', message);
		propStrictEqual(config, values, 'repo', message);
		propStrictEqual(config, values, 'ref', message);

		if (values.repoOwner) {
			propStrictEqual(config, values, 'repoOwner', message);
		}
		if (values.repoProject) {
			propStrictEqual(config, values, 'repoProject', message);
		}

		var json = config.toJSON();
		assert.jsonSchema(json, configSchema, message + ' schema');
		propStrictEqual(json, values, 'typingsPath', message + ' json');
		propStrictEqual(json, values, 'version', message + ' json');
		propStrictEqual(json, values, 'repo', message + ' json');
		propStrictEqual(json, values, 'ref', message + ' json');
		assert.like(json.installed, values.installed);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDef(def:tsd.Def, values:any, message:string) {
		assert.ok(def, message + ' def');
		assert.ok(values, message + ' values');
		assert.instanceOf(def, tsd.Def, message + ' def');

		propStrictEqual(def, values, 'path', message);
		propStrictEqual(def, values, 'name', message);
		propStrictEqual(def, values, 'project', message);

		if (values.semver) {
			propStrictEqual(def, values, 'semver', message);
		}
		if (values.pathTerm) {
			propStrictEqual(def, values, 'pathTerm', message);
		}
		if (values.head) {
			assertDefVersion(def.head, values.head, message + '.head');
		}
		if (values.history) {
			//exactly this order
			for (var i = 0, ii = values.history.length; i < ii; i++) {
				assertDefVersion(def.history[i], values.history[i], '#' + i);
			}
			propStrictEqual(def.history, values.history, 'length', message);
		}
	}

	var assertDefArrayUnordered:AssertCB = getAssertUnorderedLike((act:tsd.Def, exp:tsd.Def) => {
		return (act.path === exp.path);
	}, (act:tsd.Def, exp:tsd.Def, message?:string) => {
		assertDef(act, exp, message);
	}, 'Def');

	export function  assertDefArray(defs:tsd.Def[], values:any[], message:string) {
		assertDefArrayUnordered(defs, values, message);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefVersion(file:tsd.DefVersion, values:any, message:string) {
		assert.ok(file, message + ' file');
		assert.ok(values, message + ' values');
		assert.instanceOf(file, tsd.DefVersion, message + ' file');

		if (values.commitSha) {
			formatSHA1(file.commit.commitSha, message + ' file.commit.commitSha');
			formatSHA1(values.commitSha, message + ' values.commitSha');
			assert.strictEqual(file.commit.commitSha, values.commitSha, message + ' file.commit.commitSha');
		}
		if (values.content) {
			assert.isString(file.content, message + ' file.content');
			propStrictEqual(file, values, 'content', message + ' file');
		}
		if (typeof values.solved !== 'undefined') {
			assert.isBoolean(values.solved, message + ' values.solved');
			propStrictEqual(file, values, 'email', message + ' file');
		}
		if (values.info) {
			assertDefInfo(file.info, values.info, message + ' file.info');
		}
		if (values.dependencies) {
			assertDefVersionArray(file.dependencies, values.dependencies, 'dependencies');
		}
	}

	var assertDefVersionArrayUnordered:AssertCB = getAssertUnorderedLike((act:tsd.DefVersion, exp:any) => {
		return (act.commit.commitSha === exp.commitSha);
	}, (act:tsd.DefVersion, exp:any, message?:string) => {
		assertDefVersion(act, exp, message + ': ' + tsd.shaShort(exp.commitSha));
	}, 'DefVersion');

	export function assertDefVersionArray(files:tsd.DefVersion[], values:any[], message:string) {
		assertDefVersionArrayUnordered(files, values, message + ' files');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAuthor(author:xm.AuthorInfo, values:any, message:string) {
		assert.ok(author, message + ' author');
		assert.ok(values, message + ' values');
		assert.instanceOf(author, xm.AuthorInfo, message + ' author');

		propStrictEqual(author, values, 'name', message);
		propStrictEqual(author, values, 'url', message);
		propStrictEqual(author, values, 'email', message);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefInfo(info:tsd.DefInfo, values:any, message:string) {
		assert.ok(info, message + ' info');
		assert.ok(values, message + ' values');
		assert.instanceOf(info, tsd.DefInfo, message + ' info');

		propStrictEqual(info, values, 'name', message);
		if (values.version) {
			propStrictEqual(info, values, 'version', message + ' info');
		}
		if (values.submodule) {
			propStrictEqual(info, values, 'submodule', message + ' info');
		}
		if (values.description) {
			assert.strictEqual(info.description, values.description, message + ' info.description');
		}
		propStrictEqual(info, values, 'projectUrl', message);
		propStrictEqual(info, values, 'reposUrl', message);

		var i, ii;
		if (values.authors) {
			assertUnorderedNaive(info.authors, values.authors, assertAuthor, message + ' authors');
		}
		if (values.references) {
			assertUnorderedNaive(info.authors, values.authors, assert.strictEqual, message + ' authors');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAPIResult(result:tsd.APIResult, values:any, message:string) {
		assert.ok(result, message + ' result');
		assert.ok(values, message + ' values');
		assert.instanceOf(result, tsd.APIResult, message + ' result');

		if (values.nameMatches) {
			assertDefArray(result.nameMatches, values.nameMatches, message + ' nameMatches');
		}
		if (values.selection) {
			assertDefVersionArray(result.selection, values.selection, message + ' selection');
		}
		if (values.definitions) {
			assertDefArray(result.definitions, values.definitions, message + ' definitions');
		}
		if (values.written) {
			assertKeyValue(result.written, values.written, assertDefVersion, message + ' written');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function listDefPaths(dir:string):Qpromise {
		return FS.listTree(dir,(full:string, stat):bool => {
			return (stat.isFile() && /\.d\.ts$/.test(full));
		}).then((paths:string[]) => {
			return paths.map((full:string) => {
				return path.relative(dir, full).replace('\\', '/');
			}).filter((short:string) => {
				return tsd.Def.isDefPath(short);
			});
		});
	}
}