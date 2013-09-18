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
	var assert = require('chai').assert;

	var shaRegExp = /^[0-9a-f]{40}$/;
	var md5RegExp = /^[0-9a-f]{32}$/;
	var configSchema = xm.FileUtil.readJSONSync('./schema/tsd-config_v4.json');

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

	export function getTempInfo(label:string, index:number, createFile:bool):TempInfo {

		var name = pad(index, 3); // + '-' + xm.jsonToIdentHash(ident, 16);
		var tmpDir = path.resolve(__dirname, label, name);
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
			fs.writeFileSync(info.configFile, fs.readFileSync('./test/fixtures/config/default.json', 'utf8'), 'utf8');
		}
		return info;
	}

	export function dump(object:any, label?:string, depth?:number = 6, showHidden?:bool = false):any {
		if (typeof label !== 'undefined') {
			console.log(label + ':');
		}
		xm.log(util.inspect(object, showHidden, depth, true));
	}

	export function dumpJSON(object:any, label?:string):any {
		if (typeof label !== 'undefined') {
			console.log(label + ':');
		}
		xm.log(JSON.stringify(object, null, 4));
	}

	export function formatSHA1(value:any, msg?:string) {
		assert.isString(value, msg);
		assert.match(String(value), shaRegExp, msg);
	}

	export function formatMD5(value:any, msg?:string) {
		assert.isString(value, msg);
		assert.match(String(value), md5RegExp, msg);
	}

	export function propStrictEqual(actual, expected, prop, label) {
		assert.strictEqual(actual[prop], expected[prop], label + '.' + prop);
	}

	export function assertConfig(config:tsd.Config, values:any, label:string) {
		assert.ok(config, label + ' config');
		assert.ok(values, label + ' values');
		assert.instanceOf(config, tsd.Config, label + ' config');

		propStrictEqual(config, values, 'typingsPath', label);
		propStrictEqual(config, values, 'version', label);
		propStrictEqual(config, values, 'repo', label);
		propStrictEqual(config, values, 'ref', label);

		if (values.repoOwner) {
			propStrictEqual(config, values, 'repoOwner', label);
		}
		if (values.repoProject) {
			propStrictEqual(config, values, 'repoProject', label);
		}

		var json = config.toJSON();
		assert.jsonSchema(json, configSchema, label + ' schema');
		propStrictEqual(json, values, 'typingsPath', label + ' json');
		propStrictEqual(json, values, 'version', label + ' json');
		propStrictEqual(json, values, 'repo', label + ' json');
		propStrictEqual(json, values, 'ref', label + ' json');
		assert.like(json.installed, values.installed);
	}

	export function assertDef(def:tsd.Def, values:any, label:string) {
		assert.ok(def, label + ' def');
		assert.ok(values, label + ' values');
		assert.instanceOf(def, tsd.Def, label + ' def');

		propStrictEqual(def, values, 'path', label);
		propStrictEqual(def, values, 'name', label);
		propStrictEqual(def, values, 'project', label);

		if (values.semver) {
			propStrictEqual(def, values, 'semver', label);
		}
		if (values.pathTerm) {
			propStrictEqual(def, values, 'pathTerm', label);
		}
		if (values.head) {
			assertDefVersion(def.head, values.head, label + '.head');
		}
		if (values.history) {
			propStrictEqual(def.history, values.history, 'length', label);
			for (var i = 0, ii = values.history.length; i < ii; i++) {
				assertDefVersion(def.history[i], values.history[i], '#' + i);
			}
		}
	}

	export function assertDefArray(defs:tsd.Def[], values:any[], label:string) {
		assert.ok(defs, label + ' defs');
		assert.ok(values, label + ' values');
		assert.isArray(defs, label + ' defs');

		var v = 0;
		var queue:tsd.Def[] = defs.slice(0);
		outer : while (values.length > 0) {
			v++;
			var value = values.pop();
			for (var i = 0, ii = queue.length; i < ii; i++) {
				if (queue[i].path === value.path) {
					assertDef(queue[i], value, label + '[' + v + ']: ' + value.path);
					queue.splice(i, 1);

					continue outer;
				}
			}
			//bad
			assert(false, label + ': missing value.path ' + value.path + ' in ' + queue.join());
		}
		if (queue.length > 0) {
			assert(false, label + ': remaining def.path\'s: ' + queue.join());
		}
	}

	export function assertDefVersion(file:tsd.DefVersion, values:any, label:string) {
		assert.ok(file, label + ' file');
		assert.ok(values, label + ' values');
		assert.instanceOf(file, tsd.DefVersion, label + ' file');

		if (values.commitSha) {
			formatSHA1(file.commit.commitSha, label + ' file.commit.commitSha');
			formatSHA1(values.commitSha, label + ' values.commitSha');
			assert.strictEqual(file.commit.commitSha, values.commitSha, label + ' file.commit.commitSha');
		}
		if (values.content) {
			assert.isString(file.content, label + ' file.content');
			propStrictEqual(file, values, 'content', label + ' file');
		}
		if (typeof values.solved !== 'undefined') {
			assert.isBoolean(values.solved, label + ' values.solved');
			propStrictEqual(file, values, 'email', label + ' file');
		}
		if (values.info) {
			assertDefInfo(file.info, values.info, label + ' file.info');
		}
		if (values.dependencies) {
			propStrictEqual(file.dependencies, values.dependencies, 'length', label);
			for (var i = 0, ii = values.dependencies.length; i < ii; i++) {
				assertDefVersion(file.dependencies[i], values.dependencies[i], '#' + i);
			}
		}
	}

	export function assertDefVersionArray(files:tsd.DefVersion[], values:any[], label:string) {
		assert.ok(files, label + ' files');
		assert.ok(values, label + ' values');
		assert.isArray(files, label + ' files');

		var queue:tsd.DefVersion[] = files.slice(0);
		outer : while (values.length > 0) {
			var value = values.pop();
			for (var i = 0, ii = queue.length; i < ii; i++) {
				if (queue[i].commit.commitSha === value.commitSha) {
					assertDefVersion(queue[i], value, label + ' #' + tsd.shaShort(value.commitSha));
					queue.splice(i, 1);

					continue outer;
				}
			}
			//bad
			assert(false, label + ': missing value.path: ' + value.commitSha + ' in ' + queue.join());
		}
		if (queue.length > 0) {
			assert(false, label + ': remaining file.path\'s: ' + queue.join(', '));
		}
	}

	export function assertAuthor(author:xm.AuthorInfo, values:any, label:string) {
		assert.ok(author, label + ' author');
		assert.ok(values, label + ' values');
		assert.instanceOf(author, xm.AuthorInfo, label + ' author');

		propStrictEqual(author, values, 'name', label);
		propStrictEqual(author, values, 'url', label);
		propStrictEqual(author, values, 'email', label);
	}

	export function assertDefInfo(info:tsd.DefInfo, values:any, label:string) {
		assert.ok(info, label + ' info');
		assert.ok(values, label + ' values');
		assert.instanceOf(info, tsd.DefInfo, label + ' info');

		propStrictEqual(info, values, 'name', label);
		if (values.version) {
			propStrictEqual(info, values, 'version', label + ' info');
		}
		if (values.submodule) {
			propStrictEqual(info, values, 'submodule', label + ' info');
		}
		if (values.description) {
			assert.strictEqual(info.description, values.description, label + ' info.description');
		}
		propStrictEqual(info, values, 'projectUrl', label);
		propStrictEqual(info, values, 'reposUrl', label);

		var i, ii;
		if (values.authors) {
			//TODO make reorder-safe
			propStrictEqual(info.authors, values.authors, 'length', label);
			for (i = 0, ii = values.authors.length; i < ii; i++) {
				assertAuthor(info.authors[i], values.authors[i], 'values.authors #' + i);
			}
		}
		if (values.references) {
			//TODO make reorder-safe
			propStrictEqual(info.references, values.references, 'length', label);
			for (i = 0, ii = values.references.length; i < ii; i++) {
				assert.strictEqual(info.references[i], values.references[i], 'values.references #' + i);
			}
		}
	}

	export function assertAPIResult(result:tsd.APIResult, values:any, label:string) {
		assert.ok(result, label + ' result');
		assert.ok(values, label + ' values');
		//xm.log.inspect(result);
		if (values.nameMatches) {
			assertDefArray(result.nameMatches, values.nameMatches, label + ' nameMatches');
		}
		if (values.selection) {
			assertDefVersionArray(result.selection, values.selection, label + ' selection');
		}
		if (values.definitions) {
			assertDefArray(result.definitions, values.definitions, label + ' definitions');
		}
		if (values.written) {
			assertKeyValue(result.written, values.written, (actual, expected, label) => {
				assertDefVersion(actual, expected, label);
			}, label + ' written');
		}
	}

	export interface AssertCB {
		(actual, expected, label):void;
	}
	export function assertKeyValue(map:xm.IKeyValueMap, values:any, assertion:AssertCB, label:string) {
		assert.isObject(map, label + ' map');
		assert.isObject(values, label + ' values');
		assert.isFunction(values, label + ' assertion');

		var keys:string[] = map.keys();
		values.keys().forEach((key:string) => {
			var i = keys.indexOf(key);
			assert(i > -1, label + ' expected key "' + key + '"');
			keys.splice(i, 1);
			assert(map.has(key), label + ' missing key "' + key + '"');
			assertion(map.get(key), values[key], label + ' key "' + key + '"');
		});
		assert(keys.length === 0, label + ' unexpected keys remaining: ' + keys + '');
	}
}