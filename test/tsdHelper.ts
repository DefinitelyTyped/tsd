///<reference path="_ref.ts" />
///<reference path="../src/xm/io/FileUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />
///<reference path="../src/xm/data/PackageJSON.ts" />
///<reference path="../src/tsd/context/Const.ts" />
///<reference path="../src/tsd/data/Def.ts" />
///<reference path="helper.ts" />

module helper {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert:chai.Assert = require('chai').assert;
	var q:QStatic = require('q');
	var FS:Qfs = require('q-io/fs');

	export var configSchema = xm.FileUtil.readJSONSync(path.join(helper.getProjectRoot(), 'schema', tsd.Const.configSchemaFile));

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function pad(num:number, len:number):string {
		var ret = num.toString(10);
		while (ret.length < len) {
			ret = '0' + ret;
		}
		return ret;
	}

	export function getCacheDir():string {
		return path.join(helper.getProjectRoot(), 'test', 'fixtures', tsd.Const.cacheDir);
	}

	export function getContext() {
		var context:tsd.Context;
		context = new tsd.Context();
		context.paths.cacheDir = getCacheDir();
		return context;
	}

	export class TestInfo {
		name:string;
		group:string;

		tmpDir:string;
		fixturesDir:string;
		typingsDir:string;

		configFile:string;
		resultFile:string;

		testDump:string;
		selectorDump:string;

		resultExpect:string;
		configExpect:string;
	}

	export function getTestInfo(group:string, name:string, createConfigFile?:bool = true):TestInfo {

		var tmpDir = path.join(__dirname, 'command', group, name);
		var dumpDir = path.resolve(tmpDir, 'dump');
		var fixturesDir = path.resolve(__dirname, '..', 'fixtures', 'command', group, name);

		xm.mkdirCheckSync(tmpDir, true);

		var info = new TestInfo();
		info.name = name;
		info.group = group;

		info.tmpDir = tmpDir;
		info.fixturesDir = fixturesDir;
		info.typingsDir = path.join(tmpDir, 'typings');

		info.configFile = path.join(tmpDir, tsd.Const.configFile);
		info.resultFile = path.join(tmpDir, 'result.json');

		info.testDump = path.join(dumpDir, 'test.json');
		info.selectorDump = path.join(dumpDir, 'selector.json');

		info.configExpect = path.join(fixturesDir,  tsd.Const.configFile);
		info.resultExpect = path.join(fixturesDir, 'result.json');

		if (createConfigFile) {
			fs.writeFileSync(info.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
		}
		return info;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertConfig(config:tsd.Config, values:any, message:string) {
		assert.ok(config, message + ': config');
		assert.ok(values, message + ': values');
		assert.instanceOf(config, tsd.Config, message + ': config');

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
		assert.jsonSchema(json, configSchema, message + ': schema');
		propStrictEqual(json, values, 'typingsPath', message + ': json');
		propStrictEqual(json, values, 'version', message + ': json');
		propStrictEqual(json, values, 'repo', message + ': json');
		propStrictEqual(json, values, 'ref', message + ': json');
		if (values.installed) {
			assert.like(json.installed, values.installed);
		}
		else {
			assert.like(json.installed, {});
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDef(def:tsd.Def, values:any, message:string) {
		assert.ok(def, message + ': def');
		assert.ok(values, message + ': values');
		assert.instanceOf(def, tsd.Def, message + ': def');

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

	export function assertDefArray(defs:tsd.Def[], values:any[], message:string) {
		assertDefArrayUnordered(defs, values, message);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefVersion(file:tsd.DefVersion, values:any, message:string) {
		assert.ok(file, message + ': file');
		assert.ok(values, message + ': values');
		assert.instanceOf(file, tsd.DefVersion, message + ': file');

		if (values.blob) {
			assert.strictEqual(file.def.path, values.path, message + ': file.path');
		}
		if (values.commitSha) {
			helper.isStringSHA1(file.commit.commitSha, message + ': file.commit.commitSha');
			helper.isStringSHA1(values.commitSha, message + ': values.commitSha');
			assert.strictEqual(file.commit.commitSha, values.commitSha, message + ': file.commit.commitSha');
		}
		if (values.blob) {
			assertDefBlob(file.blob, values.blob, message + ': file.blob');
		}
		if (typeof values.solved !== 'undefined') {
			assert.isBoolean(values.solved, message + ': values.solved');
			propStrictEqual(file, values, 'email', message + ': file');
		}
		if (values.info) {
			assertDefInfo(file.info, values.info, message + ': file.info');
		}
		if (values.dependencies) {
			assertDefArray(file.dependencies, values.dependencies, 'dependencies');
		}
	}

	var assertDefVersionArrayUnordered:AssertCB = getAssertUnorderedLike((act:tsd.DefVersion, exp:any) => {
		if (!exp.commit) {
			return false;
		}
		return (act.commit.commitSha === exp.commit.commitSha);
	}, (act:tsd.DefVersion, exp:any, message?:string) => {
		assertDefVersion(act, exp, message + ': ' + tsd.shaShort(exp.commit.commitSha));
	}, 'DefVersion');

	export function assertDefVersionArray(files:tsd.DefVersion[], values:any[], message:string) {
		assertDefVersionArrayUnordered(files, values, message + ': files');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAuthor(author:xm.AuthorInfo, values:any, message:string) {
		assert.ok(author, message + ': author');
		assert.ok(values, message + ': values');
		assert.instanceOf(author, xm.AuthorInfo, message + ': author');

		propStrictEqual(author, values, 'name', message);
		propStrictEqual(author, values, 'url', message);
		propStrictEqual(author, values, 'email', message);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefBlob(blob:tsd.DefBlob, values:any, message:string) {
		assert.ok(blob, message + ': blob');
		assert.ok(values, message + ': values');
		assert.instanceOf(blob, tsd.DefBlob, message + ': author');

		propStrictEqual(blob, values, 'sha', message);

		if (values.content) {
			//TODO add reliable decoder
			assert.strictEqual(blob.content.toString('base64'), values.content, message + ': content');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDefInfo(info:tsd.DefInfo, values:any, message:string) {
		assert.ok(info, message + ': info');
		assert.ok(values, message + ': values');
		assert.instanceOf(info, tsd.DefInfo, message + ': info');

		propStrictEqual(info, values, 'name', message);
		if (values.version) {
			propStrictEqual(info, values, 'version', message + ': info');
		}
		if (values.submodule) {
			propStrictEqual(info, values, 'submodule', message + ': info');
		}
		if (values.description) {
			assert.strictEqual(info.description, values.description, message + ': info.description');
		}
		propStrictEqual(info, values, 'projectUrl', message);
		propStrictEqual(info, values, 'reposUrl', message);

		if (values.authors) {
			assertUnorderedNaive(info.authors, values.authors, assertAuthor, message + ': authors');
		}
		if (values.references) {
			assertUnorderedNaive(info.authors, values.authors, assert.strictEqual, message + ': authors');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertAPIResult(result:tsd.APIResult, values:any, message:string) {
		assert.ok(result, message + ': result');
		assert.ok(values, message + ': values');
		assert.instanceOf(result, tsd.APIResult, message + ': result');

		if (values.nameMatches) {
			assertDefArray(result.nameMatches, values.nameMatches, message + ': nameMatches');
		}
		if (values.selection) {
			assertDefVersionArray(result.selection, values.selection, message + ': selection');
		}
		if (values.definitions) {
			assertDefArray(result.definitions, values.definitions, message + ': definitions');
		}
		if (values.written) {
			assertKeyValue(result.written, values.written, assertDefVersion, message + ': written');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function applyCoreUpdate(core:tsd.Core) {
		applyCoreUpdateLoader(core.gitAPI.loader);
		applyCoreUpdateLoader(core.gitRaw.loader);
	}

	//set modes for fixture updates
	function applyCoreUpdateLoader(loader:xm.CachedLoader) {
		if (settings.cache.forceUpdate) {
			loader.options.modeAll();
		}
		else if (settings.cache.allowUpdate) {
			loader.options.modeAll();
		}
		else {
			loader.options.modeCached();
		}
	}

	export function assertUpdateStat(loader:xm.CachedLoader, message:string) {
		var stats = loader.stats;
		if (helper.settings.cache.forceUpdate) {
			assert.operator(stats.get('load-start'), '>=', 0, message + ': forceUpdate: load-start');
			assert.operator(stats.get('write-succes'), '>=', 0, message + ': forceUpdate: write-succes');
			assert.operator(stats.get('cache-hit'), '===', 0, message + ': forceUpdate: cache-hit');
		}
		else if (helper.settings.cache.allowUpdate) {
			//assert.operator(stats.get('load-start'), '>=', 0, message + ': allowUpdate: load-start');
			//assert.operator(stats.get('write-succes'), '>=', 0, message + ': allowUpdate: write-succes');
			//assert.operator(stats.get('cache-hit'), '>=', 0, message + ': allowUpdate: cache-hit');

			var sum = stats.get('load-start') + stats.get('write-succes') + stats.get('cache-hit');
			assert.operator(sum, '>', 0, message + ': allowUpdate: sum');
		}
		else {
			assert.operator(stats.get('load-start'), '===', 0, message + ': noUpdate: load-start');
			assert.operator(stats.get('write-succes'), '===', 0, message + ': noUpdate: write-succes');
			assert.operator(stats.get('cache-hit'), '>', 0, message + ': noUpdate: cache-hit');
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

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function serialiseAPIResult(result:tsd.APIResult):any {
		xm.assertVar('result', result, tsd.APIResult);

		var json:any = {};
		if (result.error) {
			json.error = result.error;
		}

		if (result.nameMatches) {
			json.nameMatches = result.nameMatches.map((def:tsd.Def) => {
				return serialiseDef(def, false);
			});
		}
		if (result.selection) {
			json.selection = result.selection.map((file:tsd.DefVersion) => {
				return serialiseDefVersion(file, false);
			});
		}
		if (result.definitions) {
			json.definitions = result.definitions.map((def:tsd.Def) => {
				return serialiseDef(def, false);
			});
		}
		if (result.written) {
			json.written = {};
			result.written.keys().forEach((key) => {
				json.written[key] = serialiseDefVersion(result.written.get(key), false);
			});
		}
		return json;
	}

	export function serialiseDef(def:tsd.Def, recursive:bool):any {
		xm.assertVar('def', def, tsd.Def);

		var json:any = {};
		json.path = def.path;
		json.project = def.project;
		json.name = def.name;
		json.semver = def.semver;

		json.def = serialiseDefVersion(def.head, false);
		json.history = [];
		//version from the DefIndex commit +tree (may be not our edit)
		if (def.history && recursive) {
			def.history.forEach((file:tsd.DefVersion) => {
				json.history.push(serialiseDefVersion(file, false));
			});
		}
		return json;
	}

	export function serialiseDefVersion(file:tsd.DefVersion, recursive:bool):any {
		xm.assertVar('file', file, tsd.DefVersion);

		var json:any = {};
		json.path = file.def.path;
		json.commit = serialiseDefCommit(file.commit, false);
		if (file.blob) {
			json.blob = serialiseDefBlob(file.blob, false);
		}
		json.key = file.key;
		json.solved = file.solved;
		if (file.dependencies) {
			json.dependencies = [];
			file.dependencies.forEach((def:tsd.Def) => {
				json.dependencies.push(serialiseDef(def, false));
			});
		}
		return json;
	}

	export function serialiseDefBlob(blob:tsd.DefBlob, recursive:bool):any {
		xm.assertVar('blob', blob, tsd.DefBlob);

		var json:any = {};
		json.sha = blob.sha;
		if (blob.content && recursive) {
			json.content = blob.content.toString('base64');
		}
		return json;
	}

	export function serialiseDefCommit(commit:tsd.DefCommit, recursive:bool):any {
		xm.assertVar('commit', commit, tsd.DefCommit);

		var json:any = {};
		json.commitSha = commit.commitSha;
		//TODO serialise more DefCommit
		return json;
	}

	export function serialiseDefInfo(info:tsd.DefInfo, recursive:bool):any {
		xm.assertVar('info', info, tsd.DefInfo);

		var json:any = {};
		json.name = info.name;
		json.version = info.version;
		json.submodule = info.submodule;
		json.description = info.description;
		json.projectUrl = info.projectUrl;
		json.reposUrl = info.reposUrl;
		json.references = info.references.slice(0);
		json.authors = [];
		if (info.authors && recursive) {
			info.authors.forEach((author:xm.AuthorInfo) => {
				json.authors.push(serialiseAuthor(author));
			});
		}
		return json;
	}

	export function serialiseAuthor(author:xm.AuthorInfo):any {
		xm.assertVar('author', author, xm.AuthorInfo);
		return author.toJSON();
	}
}
