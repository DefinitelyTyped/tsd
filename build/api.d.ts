/// <reference path="../src/_ref.d.ts" />
/// <reference path="../typings/fixes.d.ts" />
/// <reference path="../src/xm/_ref.d.ts" />
/// <reference path="../typings/miniwrite/miniwrite.d.ts" />
/// <reference path="../typings/ministyle/ministyle.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../src/git/_ref.d.ts" />
declare module tsd {
}
declare module xm {
    function typeOf(obj: any): string;
    function toProtoString(obj: any): string;
    function hasOwnProp(obj: any, prop: string): boolean;
    function isType(obj: any, type: string): boolean;
    function isArguments(obj: any): boolean;
    function isArray(obj: any): boolean;
    function isDate(obj: any): boolean;
    function isFunction(obj: any): boolean;
    function isNumber(obj: any): boolean;
    function isRegExp(obj: any): boolean;
    function isString(obj: any): boolean;
    function isNull(obj: any): boolean;
    function isUndefined(obj: any): boolean;
    function isObject(obj: any): boolean;
    function isBoolean(obj: any): boolean;
    function isArrayLike(obj: any): boolean;
    function isOk(obj: any): boolean;
    function isFlagOn(obj: any): boolean;
    function isValid(obj: any): boolean;
    function isJSONValue(obj: any): boolean;
    function isPrimitive(obj: any): boolean;
    function isValueType(obj: any): boolean;
    function getTypeOfMap(add?: any): {};
    function getTypeOfWrap(add?: any): (obj: any, type: string) => boolean;
}
declare module xm {
    function keysOf<K, V>(map: Map<K, V>): K[];
    function valuesOf<K, V>(map: Map<K, V>): V[];
    function toArray<T>(iterator: ArrayIterator<T>): T[];
}
declare module xm {
    module object {
        function hasOwnProp(obj: any, prop: string): boolean;
        function defineProp(object: Object, property: string, settings: any): void;
        function defineProps(object: Object, propertyNames: string[], settings: any): void;
        function hidePrefixed(object: Object, ownOnly?: boolean): void;
        function hideProps(object: Object, props: string[]): void;
        function lockProps(object: Object, props: string[], pub?: boolean, pref?: boolean): void;
        function forceProps(object: Object, props: Object): void;
        function freezeProps(object: Object, props: string[]): void;
        function lockPrimitives(object: Object): void;
        function deepFreeze(object: Object): void;
    }
}
declare module xm {
    var singleQuoteExp: RegExp;
    var doubleQuoteExp: RegExp;
    interface ReplaceCallback {
        (substring: string, ...args: any[]): string;
    }
    function getReplacerFunc(matches: string[], values: string[]): ReplaceCallback;
    interface IReplacer {
        (input: string): string;
    }
    function getEscaper(vars: any): IReplacer;
    function getMultiReplacer(vars: any): IReplacer;
    var unprintCC: IReplacer;
    var unprintNL: IReplacer;
    var unprintNotNL: IReplacer;
    var unprintNLS: IReplacer;
    function quoteSingle(input: string): string;
    function quoteDouble(input: string): string;
    function quoteSingleWrap(input: string): string;
    function quoteDoubleWrap(input: string): string;
    function escapeControl(input: string, reAddNewlines?: boolean): string;
    function wrapQuotes(input: string, double?: boolean): string;
    function wrapIfComplex(input: string, double?: boolean): string;
    function trim(value: string, cutoff?: number): string;
    function trimWrap(value: string, cutoff?: number, double?: boolean): string;
    function escapeSimple(str: string): string;
    function escapeHTML(html: string): string;
}
interface Function {
    name: string;
}
declare module xm {
    function getFuncLabel(func: any): string;
    function toValueStrim(obj: any, depth?: number, cutoff?: number): string;
}
declare module xm {
    function isSha(value: any): boolean;
    function isShaShort(value: any): boolean;
    function isMd5(value: any): boolean;
    function assert(pass: boolean, message: string, actual?: any, expected?: any, showDiff?: boolean, ssf?: any): void;
    function throwAssert(message: string, actual?: any, expected?: any, showDiff?: boolean, ssf?: any): void;
    function assertVar(value: any, type: any, label: string, opt?: boolean): void;
}
declare module xm {
    class StyledOut {
        private _style;
        private _line;
        private _tabSize;
        public nibs: {
            arrow: string;
            double: string;
            single: string;
            bullet: string;
            edge: string;
            ruler: string;
            shell: string;
            dash: string;
            decl: string;
            none: string;
        };
        constructor(write?: MiniWrite.Line, style?: MiniStyle.Style);
        public write(str: any): StyledOut;
        public line(str?: any): StyledOut;
        public ln(): StyledOut;
        public span(str: any): StyledOut;
        public block(str: any): StyledOut;
        public clear(): StyledOut;
        public ruler(levels?: number): StyledOut;
        public heading(str: any, level?: number): StyledOut;
        public plain(str: any): StyledOut;
        public accent(str: any): StyledOut;
        public muted(str: any): StyledOut;
        public space(): StyledOut;
        public sp(): StyledOut;
        public success(str: any): StyledOut;
        public warning(str: any): StyledOut;
        public error(str: any): StyledOut;
        public cond(condition: boolean, str: any, alt?: any): StyledOut;
        public alt(str: any, alt: any): StyledOut;
        public inspect(value: any, depth?: number, showHidden?: boolean): StyledOut;
        public stringWrap(str: string): StyledOut;
        public glue(out: StyledOut): StyledOut;
        public swap(out: StyledOut): StyledOut;
        public label(label: string): StyledOut;
        public indent(levels?: number): StyledOut;
        public bullet(accent?: boolean): StyledOut;
        public index(num: any): StyledOut;
        public info(accent?: boolean): StyledOut;
        public report(accent?: boolean): StyledOut;
        public note(accent?: boolean): StyledOut;
        public shell(accent?: boolean): StyledOut;
        public dash(accent?: boolean): StyledOut;
        public edge(accent?: boolean): StyledOut;
        public tweakURI(str: string, trimHttp?: boolean, wrapAngles?: boolean): StyledOut;
        public tweakPath(str: string, muted?: boolean): StyledOut;
        public tweakPunc(str: string, muted?: boolean): StyledOut;
        public tweakBraces(str: string, muted?: boolean): StyledOut;
        public tweakExp(str: string, expr: RegExp, muted?: boolean): StyledOut;
        public unfunk(): StyledOut;
        public finalise(): void;
        public useStyle(mini: MiniStyle.Style): StyledOut;
        public useWrite(mini: MiniWrite.Line): StyledOut;
        public getWrite(): MiniWrite.Chars;
        public getStyle(): MiniStyle.Style;
    }
}
declare module xm {
    var consoleOut: StyledOut;
    var log: Logger;
    interface Logger {
        (...args: any[]): void;
        ok(...args: any[]): void;
        log(...args: any[]): void;
        warn(...args: any[]): void;
        error(...args: any[]): void;
        debug(...args: any[]): void;
        status(...args: any[]): void;
        level(level: string, ...args: any[]): void;
        inspect(value: any, depth?: number, label?: string): void;
        json(value: any): void;
        enabled: boolean;
        out: StyledOut;
    }
    class LogLevel {
        static ok: string;
        static log: string;
        static warn: string;
        static error: string;
        static debug: string;
        static status: string;
    }
    function getLogger(label?: string): Logger;
}
declare module tsd {
    var Const: {
        rc: string;
        ident: string;
        configFile: string;
        typingsDir: string;
        cacheDir: string;
        bundleFile: string;
        settings: string;
        configVersion: string;
        configSchemaFile: string;
        definitelyRepo: string;
        mainBranch: string;
        statsDefault: boolean;
        shaShorten: number;
    };
}
declare module tsd {
    function shaShort(sha: string): string;
}
declare module xm {
    module file {
        function distributeDir(base: string, name: string, levels: number, chunk?: number): string;
        function parseJson(text: string): any;
        function readJSONSync(src: string): any;
        function readJSON(src: string, callback: (err: Error, res: any) => void): void;
        function readJSONPromise(src: string): Q.Promise<any>;
        function writeJSONSync(dest: string, data: any): void;
        function writeJSONPromise(dest: string, data: any): Q.Promise<void>;
        function readFileSync(dest: string, encoding?: string): any;
        function writeFileSync(dest: string, data: any, encoding?: string): void;
        function mkdirCheckSync(dir: string, writable?: boolean, testWritable?: boolean): string;
        function mkdirCheckQ(dir: string, writable?: boolean, testWritable?: boolean): Q.Promise<string>;
        function canWriteFile(targetPath: string, overwrite: boolean): Q.Promise<any>;
        function removeFile(target: string): Q.Promise<void>;
        function touchFile(src: string, atime?: Date, mtime?: Date): Q.Promise<void>;
        function findup(dir: string, name: string): Q.Promise<string>;
    }
}
declare module xm {
    function eachElem(collection: any[], callback: (value: any, index: number, collection: any[]) => void, thisArg?: any): void;
    function eachProp(collection: any, callback: (value: any, prop: string, collection: Object) => void, thisArg?: any): void;
    function reduceArray(collection: any[], memo: any, callback: (memo: any, value: any, index: number, collection: any[]) => void, thisArg?: any): any;
    function reduceHash(collection: any, memo: any, callback: (memo: any, value: any, prop: string, collection: Object) => void, thisArg?: any): any;
    function mapArray(collection: any[], callback: (value: any, index: number, collection: any[]) => void, thisArg?: any): any[];
    function mapHash(collection: any, callback: (value: any, prop: string, collection: Object) => void, thisArg?: any): any;
    function filterArray(collection: any[], callback: (value: any, index: number, collection: any[]) => boolean, thisArg?: any): any[];
    function filterHash(collection: any, callback: (value: any, prop: string, collection: Object) => boolean, thisArg?: any): any;
}
declare module xm {
    class PackageJSON {
        public path: string;
        private _pkg;
        private static _localPath;
        private static _local;
        constructor(pkg: any, path?: string);
        public raw : any;
        public name : string;
        public description : string;
        public version : string;
        public getNameVersion(): string;
        public getKey(): string;
        public getHomepage(short?: boolean): string;
        static find(): string;
        static getLocal(): PackageJSON;
    }
}
declare module xm {
    class JSONPointer {
        public objects: Object[];
        public prefix: string;
        constructor(object?: Object, prefix?: string);
        public hasValue(path: string): boolean;
        public getValue(path: string, alt?: any): any;
        public addSource(object: Object): any;
        public setValue(path: string, value?: any): void;
        public getChild(path: string, alt?: any): JSONPointer;
        public getNumber(path: string, alt?: number): number;
        public getBoolean(path: string, alt?: boolean): boolean;
        public getString(path: string, alt?: string): string;
        public getDate(path: string, alt?: Date): Date;
        public getDurationSecs(path: string, alt?: number): number;
    }
}
declare module xm {
    class JSONStabilizer {
        public depth: number;
        public style: CodeStyle;
        public keys: string[];
        public parent: JSONStabilizer;
        public children: Map<string, JSONStabilizer>;
        constructor(depth?: number, style?: CodeStyle);
        public root : JSONStabilizer;
        public parseString(jsonString: string): Object;
        public sniff(jsonString: string): void;
        public snapshot(object: Object): void;
        public getStablized(json: Object): Object;
        public toJSONString(json: Object, assumeStable?: boolean): string;
    }
    class CodeStyle {
        public eol: string;
        public indent: string;
        public trailingEOL: boolean;
        public clone(): CodeStyle;
    }
    class JSONStabilizerMap {
        public depth: number;
        public style: CodeStyle;
        public map: WeakMap<Object, JSONStabilizer>;
        constructor(depth?: number, style?: CodeStyle);
        public parseString(jsonString: string): Object;
        public associate(object: Object, snapshotNow?: boolean): JSONStabilizer;
        public toJSONString(object: Object): string;
    }
}
declare module tsd {
    class Def {
        static nameExp: RegExp;
        static nameExpEnd: RegExp;
        static versionEnd: RegExp;
        static twoNums: RegExp;
        public path: string;
        public project: string;
        public name: string;
        public semver: string;
        public head: DefVersion;
        public history: DefVersion[];
        constructor(path: string);
        public toString(): string;
        public pathTerm : string;
        static getPathExp(trim: boolean): RegExp;
        static getFileFrom(path: string): string;
        static isDefPath(path: string, trim?: boolean): boolean;
        static getFrom(path: string, trim?: boolean): Def;
    }
}
declare module xm {
    class AuthorInfo {
        public name: string;
        public url: string;
        public email: string;
        constructor(name?: string, url?: string, email?: string);
        public toString(): string;
        public toJSON(): any;
    }
}
declare module tsd {
    class DefInfo {
        public name: string;
        public version: string;
        public description: string;
        public projectUrl: string;
        public authors: xm.AuthorInfo[];
        public reposUrl: string;
        public references: string[];
        constructor();
        public resetFields(): void;
        public resetAll(): void;
        public toString(): string;
        public isValid(): boolean;
    }
}
declare module git {
    module GitUtil {
        function decodeBlobJson(blobJSON: any): NodeBuffer;
        function blobShaHex(data: NodeBuffer): string;
    }
}
declare module tsd {
    class DefBlob {
        public sha: string;
        public content: NodeBuffer;
        public encoding: string;
        constructor(sha: string, content?: any, encoding?: string);
        public hasContent(): boolean;
        public setContent(content: NodeBuffer, encoding?: string): void;
        public shaShort : string;
        public toString(): string;
    }
}
declare module tsd {
    class DefVersion {
        private _def;
        private _commit;
        private _blob;
        public dependencies: Def[];
        public solved: boolean;
        public info: DefInfo;
        constructor(def: Def, commit: DefCommit);
        public setContent(blob: DefBlob): void;
        public hasContent(): boolean;
        public key : string;
        public def : Def;
        public commit : DefCommit;
        public blob : DefBlob;
        public blobShaShort : string;
        public toString(): string;
    }
}
declare module tsd {
    class InstalledDef {
        public path: string;
        public commitSha: string;
        constructor(path: string);
        public update(file: DefVersion): void;
        public toString(): string;
    }
    class Config implements git.GithubRepoConfig {
        public path: string;
        public version: string;
        public repo: string;
        public ref: string;
        public stats: boolean;
        public bundle: string;
        private _installed;
        private _schema;
        private _stable;
        public log: xm.Logger;
        constructor(schema: any);
        public reset(): void;
        public resolveTypingsPath(relativeToDir: string): string;
        public repoOwner : string;
        public repoProject : string;
        public repoRef : string;
        public schema : any;
        public addFile(file: DefVersion): void;
        public hasFile(filePath: string): boolean;
        public getFile(filePath: string): InstalledDef;
        public removeFile(filePath: string): void;
        public getInstalled(): InstalledDef[];
        public getInstalledPaths(): string[];
        public toJSON(): any;
        public toJSONString(): string;
        public parseJSONString(input: string, label?: string, log?: boolean): any;
        public parseJSON(json: any, label?: string, log?: boolean): any;
        public validateJSON(json: any, schema: any, label?: string, log?: boolean): any;
    }
}
declare module tsd {
    class Paths {
        public configFile: string;
        public cacheDir: string;
        public startCwd: string;
        constructor();
        static getCacheDirName(): string;
        static getUserHome(): string;
        static getUserRoot(): string;
        static getUserCacheDir(): string;
    }
}
declare module tsd {
    class Context {
        public paths: Paths;
        public config: Config;
        public packageInfo: xm.PackageJSON;
        public verbose: boolean;
        public settings: xm.JSONPointer;
        public configSchema: any;
        constructor(configFile?: string, verbose?: boolean);
        public stackSettings(src: string): void;
        public getTypingsDir(): string;
        public getInfo(details?: boolean): Object;
    }
}
declare module xm {
    class RegExpGlue {
        public parts: any[];
        constructor(...exp: any[]);
        static get(...exp: any[]): RegExpGlue;
        static escapeChars(str: string): string;
        public append(...exp: any[]): RegExpGlue;
        public getBody(exp: RegExp): string;
        public getFlags(exp: RegExp): string;
        public getCleanFlags(flags: String): string;
        public join(flags?: string, seperator?: RegExp): RegExp;
    }
}
declare module tsd {
    class NameMatcher {
        public pattern: string;
        private projectExp;
        private nameExp;
        constructor(pattern: string);
        public filter(list: Def[], current: Def[]): Def[];
        public toString(): string;
        private compile();
        private compileSingle();
        private compileSplit();
        private getFilterFunc(current);
    }
}
declare module tsd {
    class InfoMatcher {
        public filter(list: DefVersion[]): DefVersion[];
    }
}
declare module xm {
    module date {
        function getISOString(input: any): string;
        function toNiceUTC(date: Date): string;
        function isBeforeDate(actual: Date, base: Date): boolean;
        function isAfterDate(actual: Date, base: Date): boolean;
        function isEqualDate(actual: Date, base: Date): boolean;
        function compare(date1: Date, date2: Date): number;
    }
}
declare module tsd {
    class DateComp {
        public operator: string;
        public comparator: (date1: Date, date2: Date) => boolean;
        public date: Date;
        public satisfies(date: Date): boolean;
    }
    class DateMatcher {
        public comparators: DateComp[];
        constructor(pattern?: string);
        public filter(list: DefVersion[]): DefVersion[];
        public best(list: DefVersion[]): DefVersion;
        public latest(list: DefVersion[]): DefVersion;
        public extractSelector(pattern: string): void;
        private getFilterFunc();
    }
}
declare module tsd {
    class VersionMatcher {
        static latest: string;
        static all: string;
        public range: string;
        constructor(range: string);
        public filter(list: Def[]): Def[];
        private getLatest(list);
    }
}
declare module tsd {
    class CommitMatcher {
        public commitSha: string;
        public minimumShaLen: number;
        constructor(commitSha?: string);
        public filter(list: DefVersion[]): DefVersion[];
        public getFilterFunc(commitSha: string): (file: DefVersion) => boolean;
    }
}
declare module tsd {
    class Query {
        public patterns: NameMatcher[];
        public versionMatcher: VersionMatcher;
        public dateMatcher: DateMatcher;
        public infoMatcher: InfoMatcher;
        public commitMatcher: CommitMatcher;
        public parseInfo: boolean;
        public loadHistory: boolean;
        constructor(pattern?: string);
        public addNamePattern(pattern: string): void;
        public requiresSource : boolean;
        public requiresHistory : boolean;
        public toString(): string;
    }
}
declare module xm {
    interface URLTemplateParser {
        (template: string): URLTemplate;
    }
    interface URLTemplate {
        fillFromObject(vars: any): string;
        fill(callback: (varName: string) => string): string;
        fromUri(uri: string): any;
    }
    class URLManager {
        private _templates;
        private _vars;
        constructor(common?: any);
        public addTemplate(id: string, url: string): void;
        public setVar(id: string, value: any): void;
        public getVar(id: string): string;
        public setVars(map: any): void;
        public getTemplate(id: string): URLTemplate;
        public getURL(id: string, vars?: any): string;
    }
}
declare module git {
    class GithubURLs extends xm.URLManager {
        private _base;
        private _apiBase;
        private _api;
        private _raw;
        private _repo;
        constructor(repo: GithubRepo);
        public getURL(id: string, vars?: any): string;
        public api(): string;
        public base(): string;
        public raw(): string;
        public rawFile(ref: string, path: string): string;
        public htmlFile(ref: string, path: string): string;
        public apiBranches(): string;
        public apiBranch(name: string): string;
        public apiTree(tree: string, recursive?: any): string;
        public apiPathCommits(path: string): string;
        public apiCommit(commit: string, recursive?: any): string;
        public apiBlob(sha: string): string;
        public rateLimit(): string;
    }
}
declare module git {
    interface GithubRepoConfig {
        repoOwner: string;
        repoProject: string;
    }
}
declare module xm {
    class ActionMap<T> {
        private _map;
        constructor(data?: any);
        public run(id: string, call: (value: T) => any, optional?: boolean): Q.Promise<T>;
        public runSerial(ids: string[], call: (value: T) => any, optional?: boolean): Q.Promise<T>;
        public has(key: string): boolean;
        public get(key: string): T;
        public set(key: string, value: T): Map<string, T>;
    }
    class PromiseHandle<T> {
        public promise: Q.Promise<T>;
        public defer: Q.Deferred<T>;
        constructor(defer?: Q.Deferred<T>, promise?: Q.Promise<T>);
    }
    class PromiseStash<T> {
        private _stash;
        constructor();
        public has(key: string): boolean;
        public promise(key: string): Q.Promise<T>;
        public defer(key: string): Q.Deferred<T>;
        public remove(key: string): void;
    }
}
declare module xm {
    class StatCounter {
        public stats: {
            [id: string]: number;
        };
        public log: Logger;
        constructor(log?: Logger);
        public count(id: string, label?: string): number;
        public get(id: string): number;
        public has(id: string): boolean;
        public zero(): void;
        public total(): number;
        public counterNames(): string[];
        public hasAllZero(): boolean;
        public clear(): void;
        public getReport(label?: string): string;
        public getObject(): any;
    }
}
declare module xm {
    function valueMap(data: any): any;
    var EventLevel: {
        start: string;
        complete: string;
        failure: string;
        skip: string;
        share: string;
        event: string;
        error: string;
        warning: string;
        success: string;
        status: string;
        promise: string;
        resolve: string;
        reject: string;
        notify: string;
        debug: string;
        log: string;
    };
    var startTime: number;
    class EventLog {
        private _items;
        private _label;
        private _prefix;
        private _startAt;
        public logger: Logger;
        public logEnabled: boolean;
        private _trackEnabled;
        private _trackLimit;
        private _trackPrune;
        private _mutePromises;
        constructor(prefix?: string, label?: string, logger?: Logger);
        public promise(promise: Q.Promise<any>, type: string, message?: string, data?: any): EventLogItem;
        public start(type: string, message?: string, data?: any): EventLogItem;
        public complete(type: string, message?: string, data?: any): EventLogItem;
        public failure(type: string, message?: string, data?: any): EventLogItem;
        public event(type: string, message?: string, data?: any): EventLogItem;
        public skip(type: string, message?: string, data?: any): EventLogItem;
        public share(type: string, message?: string, data?: any): EventLogItem;
        public error(type: string, message?: string, data?: any): EventLogItem;
        public warning(type: string, message?: string, data?: any): EventLogItem;
        public success(type: string, message?: string, data?: any): EventLogItem;
        public status(type: string, message?: string, data?: any): EventLogItem;
        public log(type: string, message?: string, data?: any): EventLogItem;
        public debug(type: string, message?: string, data?: any): EventLogItem;
        public track(action: string, type: string, message?: string, data?: any, group?: any): EventLogItem;
        public trim(all?: boolean): void;
        public reset(): void;
        public isMuted(action: string): boolean;
        public muteActions(actions: string[]): void;
        public unmuteActions(actions?: string[]): void;
        public unmuteAll(): void;
        public setTrack(enabled: boolean, limit?: number, prune?: number): void;
        public getItemString(item: EventLogItem, multiline?: boolean): string;
        public getHistory(): string;
        public getStats(): StatCounter;
        public getItems(): EventLogItem[];
        public getReport(label?: string): string;
    }
    class EventLogItem {
        public type: string;
        public action: string;
        public message: string;
        public data: any;
        public index: number;
        public time: number;
        public group: any;
        constructor();
        public toString(): string;
    }
}
declare module xm {
    function md5(data: any): string;
    function sha1(data: any): string;
    function sha1Short(data: any, length?: number): string;
    function hashNormalines(input: string): string;
    function jsonToIdent(obj: any): string;
    function jsonToIdentHash(obj: any, length?: number): string;
}
declare module xm {
    interface IContentKoder<T> {
        decode(content: NodeBuffer): Q.Promise<T>;
        encode(value: T): Q.Promise<NodeBuffer>;
    }
    class StringKoder implements IContentKoder<string> {
        public encoding: string;
        constructor(encoding?: string);
        public decode(content: NodeBuffer): Q.Promise<string>;
        public encode(value: string): Q.Promise<NodeBuffer>;
        static utf8: StringKoder;
    }
    class ByteKoder implements IContentKoder<NodeBuffer> {
        public decode(content: NodeBuffer): Q.Promise<NodeBuffer>;
        public encode(value: NodeBuffer): Q.Promise<NodeBuffer>;
        static main: ByteKoder;
    }
    class JSONKoder<T> implements IContentKoder<T> {
        public schema: any;
        constructor(schema?: Object);
        public decode(content: NodeBuffer): Q.Promise<T>;
        public assert(value: T): void;
        public encode(value: T): Q.Promise<NodeBuffer>;
        static main: JSONKoder<any>;
    }
}
declare module xm {
    interface Notification {
        code: string;
        message: string;
        data: any;
    }
    function getNote(message: string, code?: any, data?: any): Notification;
}
declare module xm {
    module http {
        enum CacheMode {
            forceLocal = 1,
            forceRemote = 2,
            forceUpdate = 3,
            allowRemote = 4,
            allowUpdate = 5,
        }
        class CacheOpts {
            public compressStore: boolean;
            public splitDirLevel: number;
            public splitDirChunk: number;
            public cacheRead: boolean;
            public cacheWrite: boolean;
            public remoteRead: boolean;
            public allowClean: boolean;
            public cacheCleanInterval: number;
            public jobTimeout: number;
            constructor(mode?: CacheMode);
            public applyCacheMode(mode: CacheMode): void;
        }
    }
}
declare module xm {
    module http {
        class CacheStreamLoader {
            static get_object: string;
            static info_read: string;
            static cache_read: string;
            static cache_write: string;
            static cache_remove: string;
            static http_load: string;
            static http_error: string;
            static local_info_bad: string;
            static local_info_empty: string;
            static local_info_malformed: string;
            static local_body_bad: string;
            static local_body_empty: string;
            static local_cache_hit: string;
            static http_cache_hit: string;
            public cache: HTTPCache;
            public request: CacheRequest;
            public object: CacheObject;
            public infoCacheValidator: IObjectValidator;
            public bodyCacheValidator: IObjectValidator;
            public track: EventLog;
            private _defer;
            constructor(cache: HTTPCache, request: CacheRequest);
            public destruct(): void;
            private canUpdate();
            public getObject(): Q.Promise<CacheObject>;
            private cacheRead();
            private httpLoad(httpCache?);
            private cacheWrite(cacheWasFresh);
            private checkExists(file, label);
            private cacheRemove();
            private cacheTouch();
            private copyInfo(res, checksum);
            private updateInfo(res, checksum);
            private readInfo();
            public toString(): string;
        }
    }
}
declare module xm {
    function assertJSONSchema(value: any, schema: any): void;
}
declare module xm {
    module http {
        class CacheRequest {
            public key: string;
            public locked: boolean;
            public url: string;
            public headers: any;
            public localMaxAge: number;
            public httpInterval: number;
            public forceRefresh: boolean;
            static lockProps: string[];
            static keyHeaders: string[];
            constructor(url: string, headers?: any);
            public lock(): CacheRequest;
        }
        class CacheObject {
            public request: CacheRequest;
            public storeDir: string;
            public infoFile: string;
            public info: CacheInfo;
            public response: ResponseInfo;
            public bodyFile: string;
            public bodyChecksum: string;
            public body: NodeBuffer;
            constructor(request: CacheRequest);
        }
        class ResponseInfo {
            public status: number;
            public headers: any;
        }
        interface CacheInfo {
            url: string;
            key: string;
            contentType: string;
            httpETag: string;
            httpModified: string;
            cacheCreated: string;
            cacheUpdated: string;
            contentChecksum: string;
        }
        interface IObjectValidator {
            assert(object: CacheObject): void;
        }
        class SimpleValidator implements IObjectValidator {
            public assert(object: CacheObject): void;
            static main: SimpleValidator;
        }
        class CacheValidator implements IObjectValidator {
            public schema: any;
            constructor(schema: any);
            public assert(object: CacheObject): void;
        }
        class CacheAgeValidator implements IObjectValidator {
            public schema: any;
            public maxAgeMili: number;
            constructor(schema: any, maxAgeMili?: number);
            public assert(object: CacheObject): void;
        }
        class ChecksumValidator implements IObjectValidator {
            public assert(object: CacheObject): void;
        }
    }
}
declare module xm {
    module http {
        interface CacheManage {
            lastSweep: string;
        }
        class HTTPCache {
            static get_object: string;
            static drop_job: string;
            static cache_clean: string;
            static check_cache_clean: string;
            static clean_cache_age: string;
            static dir_create: string;
            static dir_exists: string;
            static dir_error: string;
            static ignore_error: string;
            public storeDir: string;
            public opts: CacheOpts;
            public track: EventLog;
            public infoKoder: IContentKoder<CacheInfo>;
            public infoSchema: any;
            public proxy: string;
            private jobs;
            private jobTimers;
            private _init;
            private manageFile;
            private manageKoder;
            private manageSchema;
            private cacheSweepLast;
            constructor(storeDir: string, opts?: CacheOpts);
            public setStoreDir(dir: string): void;
            public getObject(request: CacheRequest): Q.Promise<CacheObject>;
            private scheduleRelease(key);
            private init();
            public checkCleanCache(): Q.Promise<void>;
            public cleanupCacheAge(maxAge: number): Q.Promise<void>;
            public verbose : boolean;
        }
    }
}
declare module git {
    class GithubLoader {
        public repo: GithubRepo;
        public track: xm.EventLog;
        public cache: xm.http.HTTPCache;
        public options: xm.JSONPointer;
        public storeDir: string;
        public label: string;
        public formatVersion: string;
        public headers: {};
        constructor(repo: GithubRepo, options: xm.JSONPointer, storeDir: string, prefix: string, label: string);
        public _initGithubLoader(lock?: string[]): void;
        public getCacheKey(): string;
        public copyHeadersTo(target: any, source?: any): void;
        public verbose : boolean;
    }
}
declare module git {
    class GitRateInfo {
        public limit: number;
        public remaining: number;
        public reset: number;
        public resetAt: string;
        public lastUpdate: number;
        constructor(map?: any);
        public readFromRes(map: any): void;
        public toString(): string;
        public getResetString(): string;
        public getTimeToReset(): number;
        public getMinutesToReset(): number;
        public isBlocked(): boolean;
        public isLimited(): boolean;
        public hasRemaining(): boolean;
    }
}
declare module git {
    class GithubAPI extends GithubLoader {
        static get_cachable: string;
        static get_rate: string;
        private apiVersion;
        constructor(repo: GithubRepo, options: xm.JSONPointer, storeDir: string);
        public getBranches(): Q.Promise<any>;
        public getBranch(branch: string): Q.Promise<any>;
        public getTree(sha: string, recursive: boolean): Q.Promise<any>;
        public getCommit(sha: string): Q.Promise<any>;
        public getBlob(sha: string): Q.Promise<any>;
        public getPathCommits(path: string): Q.Promise<any>;
        public getCachableURL(url: string): Q.Promise<any>;
        public getCachable(request: xm.http.CacheRequest, addMeta: boolean): Q.Promise<any>;
        public getRateInfo(): Q.Promise<GitRateInfo>;
        public getCacheKey(): string;
    }
}
declare module git {
    class GithubRaw extends GithubLoader {
        static get_file: string;
        constructor(repo: GithubRepo, options: xm.JSONPointer, storeDir: string);
        public getText(ref: string, filePath: string): Q.Promise<string>;
        public getJSON(ref: string, filePath: string): Q.Promise<any>;
        public getBinary(ref: string, filePath: string): Q.Promise<NodeBuffer>;
        public getFile<T>(ref: string, filePath: string, koder: xm.IContentKoder<T>): Q.Promise<T>;
        public getCacheKey(): string;
    }
}
declare module git {
    class GithubRepo {
        public config: GithubRepoConfig;
        public storeDir: string;
        public urls: GithubURLs;
        public api: GithubAPI;
        public raw: GithubRaw;
        constructor(config: GithubRepoConfig, storeDir: string, opts: xm.JSONPointer);
        public getCacheKey(): string;
        public toString(): string;
        public verbose : boolean;
    }
}
declare module tsd {
    class Options {
        public minMatches: number;
        public maxMatches: number;
        public limitApi: number;
        public resolveDependencies: boolean;
        public overwriteFiles: boolean;
        public saveToConfig: boolean;
        public addToBundles: string[];
        public timeout: number;
        static fromJSON(json: Object): Options;
        static main: any;
    }
}
declare module tsd {
    class SubCore {
        public core: Core;
        public track: xm.EventLog;
        private _verbose;
        constructor(core: Core, track: string, label: string);
        public verbose : boolean;
    }
}
declare module tsd {
    class DefUtil {
        static getDefs(list: DefVersion[]): Def[];
        static getHeads(list: Def[]): DefVersion[];
        static getHistoryTop(list: Def[]): DefVersion[];
        static getHistoryBottom(list: Def[]): DefVersion[];
        static getLatest(list: DefVersion[]): DefVersion;
        static getRecent(list: DefVersion[]): DefVersion;
        static getPaths(list: Def[]): string[];
        static getPathsOf(list: DefVersion[]): string[];
        static uniqueDefVersion(list: DefVersion[]): DefVersion[];
        static uniqueDefs(list: Def[]): Def[];
        static extractReferenceTags(source: string): string[];
        static contains(list: DefVersion[], file: DefVersion): boolean;
        static containsDef(list: Def[], def: Def): boolean;
        static mergeDependencies(list: DefVersion[], target?: DefVersion[]): DefVersion[];
        static mergeDependenciesOf(list: Def[], target?: DefVersion[]): DefVersion[];
        static matchCommit(list: DefVersion[], commitSha: string): DefVersion[];
        static haveContent(list: DefVersion[]): DefVersion[];
        static fileCompare(aa: DefVersion, bb: DefVersion): number;
        static defCompare(aa: Def, bb: Def): number;
        static fileCommitCompare(aa: DefVersion, bb: DefVersion): number;
    }
}
declare module tsd {
    class Resolver extends SubCore {
        static active: string;
        static solved: string;
        static remove: string;
        static bulk: string;
        static resolve: string;
        static parse: string;
        static subload: string;
        static dep_recurse: string;
        static dep_added: string;
        static dep_missing: string;
        private _stash;
        constructor(core: Core);
        public resolveBulk(list: DefVersion[]): Q.Promise<DefVersion[]>;
        public resolveDeps(file: DefVersion): Q.Promise<DefVersion>;
        public applyResolution(index: DefIndex, file: DefVersion, content: string): Q.Promise<DefVersion>[];
        public extractPaths(file: DefVersion, content: string): string[];
    }
}
declare module git {
    interface GithubJSONTreeElem {
        mode: string;
        type: string;
        sha: string;
        path: string;
        size: number;
        url: string;
    }
    interface GithubJSONCommit {
        mode: string;
        type: string;
        sha: string;
        path: string;
        size: number;
        url: string;
    }
}
declare module git {
    class GitUserCommit {
        public name: string;
        public email: string;
        public date: Date;
        public toString(): string;
        static fromJSON(json: any): GitUserCommit;
    }
}
declare module git {
    class GithubUser {
        public id: number;
        public login: string;
        public avatar_url: string;
        public toString(): string;
        static fromJSON(json: any): GithubUser;
    }
}
declare module git {
    class GitCommitMessage {
        public text: string;
        public subject: string;
        public body: string;
        constructor(text?: string);
        public parse(text: string): void;
        public toString(): string;
    }
}
declare module tsd {
    class DefCommit {
        public commitSha: string;
        public hasMeta: boolean;
        public message: git.GitCommitMessage;
        public hubAuthor: git.GithubUser;
        public hubCommitter: git.GithubUser;
        public gitAuthor: git.GitUserCommit;
        public gitCommitter: git.GitUserCommit;
        constructor(commitSha: string);
        public parseJSON(commit: any): void;
        public hasMetaData(): boolean;
        public toString(): string;
        public changeDate : Date;
        public commitShort : string;
    }
}
declare module tsd {
    class DefIndex {
        private _branchName;
        private _hasIndex;
        private _indexCommit;
        private _definitions;
        private _commits;
        private _blobs;
        private _versions;
        constructor();
        public hasIndex(): boolean;
        public init(branch: any, tree: any): void;
        public setHistory(def: Def, commitJsonArray: any[]): void;
        public procureCommit(commitSha: string): DefCommit;
        public procureBlob(blobSha: string): DefBlob;
        public procureBlobFor(content: NodeBuffer): DefBlob;
        public procureDef(path: string): Def;
        public procureVersion(def: Def, commit: DefCommit): DefVersion;
        public procureVersionFromSha(path: string, commitSha: string): DefVersion;
        public getDef(path: string): Def;
        public hasDef(path: string): boolean;
        public getBlob(sha: string): DefBlob;
        public hasBlob(sha: string): boolean;
        public getCommit(sha: string): DefCommit;
        public hasCommit(sha: string): boolean;
        public getPaths(): string[];
        public toDump(): string;
        public branchName : string;
        public list : Def[];
        public indexCommit : DefCommit;
        public toString(): string;
    }
}
declare module tsd {
    class IndexManager extends SubCore {
        static init: string;
        static tree_get: string;
        static branch_get: string;
        static procure_def: string;
        static procure_file: string;
        static procure_commit: string;
        private _defer;
        constructor(core: Core);
        public getIndex(): Q.Promise<DefIndex>;
        public procureDef(path: string): Q.Promise<Def>;
        public procureFile(path: string, commitSha: string): Q.Promise<DefVersion>;
        public procureCommit(commitSha: string): Q.Promise<DefCommit>;
        public findFile(path: string, commitShaFragment: string): Q.Promise<DefVersion>;
    }
}
declare module tsd {
    class ConfigIO extends SubCore {
        static config_init: string;
        static config_read: string;
        static config_save: string;
        constructor(core: Core);
        public initConfig(overwrite: boolean): Q.Promise<string>;
        public readConfig(optional?: boolean): Q.Promise<void>;
        public saveConfig(target?: string): Q.Promise<string>;
    }
}
declare module tsd {
    class ContentLoader extends SubCore {
        constructor(core: Core);
        public loadCommitMetaData(commit: DefCommit): Q.Promise<DefCommit>;
        public loadContent(file: DefVersion, tryHead?: boolean): Q.Promise<DefVersion>;
        public loadContentBulk(list: DefVersion[]): Q.Promise<DefVersion[]>;
        public loadHistory(def: Def): Q.Promise<Def>;
        public loadHistoryBulk(list: Def[]): Q.Promise<DefVersion[]>;
    }
}
declare module tsd {
    class Installer extends SubCore {
        constructor(core: Core);
        public installFile(file: DefVersion, addToConfig?: boolean, overwrite?: boolean): Q.Promise<string>;
        public installFileBulk(list: DefVersion[], addToConfig?: boolean, overwrite?: boolean): Q.Promise<Map<string, DefVersion>>;
        public reinstallBulk(list: InstalledDef[], overwrite?: boolean): Q.Promise<Map<string, DefVersion>>;
        public useFile(file: DefVersion, overwrite: boolean): Q.Promise<string>;
        public useFileBulk(list: DefVersion[], overwrite?: boolean): Q.Promise<Map<string, DefVersion>>;
    }
}
declare module xm {
    class LineParserCore {
        public verbose: boolean;
        public parsers: Map<string, LineParser>;
        constructor(verbose?: boolean);
        public addParser(parser: LineParser): void;
        public getInfo(): any;
        public getParser(id: string): LineParser;
        private link();
        public get(ids: string[]): LineParser[];
        public all(): LineParser[];
        public listIds(parsers: LineParser[]): string[];
        public parse(source: string, asType: string[]): void;
    }
    class LineParser {
        public id: string;
        public exp: RegExp;
        public groupsMin: number;
        public callback: (match: LineParserMatch) => void;
        public nextIds: string[];
        public next: LineParser[];
        constructor(id: string, exp: RegExp, groupsMin: number, callback: (match: LineParserMatch) => void, nextIds?: string[]);
        public match(str: string, offset: number, limit: number): LineParserMatch;
        public getName(): string;
    }
    class LineParserMatch {
        public parser: LineParser;
        public match: RegExpExecArray;
        constructor(parser: LineParser, match: RegExpExecArray);
        public extract(): void;
        public getGroup(num: number, alt?: string): string;
        public getGroupFloat(num: number, alt?: number): number;
        public getName(): string;
    }
}
declare module tsd {
    class DefInfoParser {
        public verbose: boolean;
        public parser: xm.LineParserCore;
        constructor(verbose?: boolean);
        public parse(data: DefInfo, source: string): void;
    }
}
declare module tsd {
    class InfoParser extends SubCore {
        constructor(core: Core);
        public parseDefInfo(file: DefVersion): Q.Promise<DefVersion>;
        public parseDefInfoBulk(list: DefVersion[]): Q.Promise<DefVersion[]>;
    }
}
declare module tsd {
    class Selection {
        public query: Query;
        public definitions: Def[];
        public selection: DefVersion[];
        public error: any;
        constructor(query?: Query);
    }
}
declare module tsd {
    class SelectorQuery extends SubCore {
        constructor(core: Core);
        public select(query: Query, options: Options): Q.Promise<Selection>;
    }
}
declare module tsd {
    class Bundle {
        private head;
        private eol;
        public target: string;
        public baseDir: string;
        constructor(target: string, baseDir?: string);
        public parse(content: string): void;
        public has(ref: string): boolean;
        public append(ref: string): void;
        public remove(ref: string): void;
        public toArray(all?: boolean): string[];
        private first(all?);
        private last(all?);
        public getContent(): string;
    }
}
declare module tsd {
    class BundleManager extends SubCore {
        static bundle_init: string;
        static bundle_read: string;
        static bundle_save: string;
        static bundle_add: string;
        constructor(core: Core);
        public addToBundle(target: string, refs: string[], save: boolean): Q.Promise<Bundle>;
        public readBundle(target: string, optional: boolean): Q.Promise<Bundle>;
        public saveBundle(bundle: Bundle): Q.Promise<void>;
    }
}
declare module tsd {
    class Core {
        public context: Context;
        public repo: git.GithubRepo;
        public index: IndexManager;
        public selector: SelectorQuery;
        public config: ConfigIO;
        public content: ContentLoader;
        public parser: InfoParser;
        public installer: Installer;
        public resolver: Resolver;
        public bundle: BundleManager;
        public track: xm.EventLog;
        public _components: MultiManager;
        public _cacheMode: string;
        constructor(context: Context);
        public updateConfig(): void;
        public getInstallPath(def: Def): string;
        public useCacheMode(modeName: string): void;
        public verbose : boolean;
    }
    interface ITrackable {
        track: xm.EventLog;
        verbose: boolean;
    }
    class MultiManager {
        public core: Core;
        private _verbose;
        public trackables: Set<ITrackable>;
        constructor(core: Core);
        public add(list: any[]): void;
        public remove(list: any[]): void;
        public replace(fields: Object): void;
        public verbose : boolean;
    }
}
declare module tsd {
    class InstallResult {
        public options: Options;
        public written: Map<string, DefVersion>;
        public removed: Map<string, DefVersion>;
        public skipped: Map<string, DefVersion>;
        constructor(options: Options);
    }
    class CompareResult {
    }
    class API {
        public context: Context;
        public core: Core;
        public track: xm.EventLog;
        constructor(context: Context);
        public initConfig(overwrite: boolean): Q.Promise<string>;
        public readConfig(optional: boolean): Q.Promise<void>;
        public saveConfig(): Q.Promise<string>;
        public select(query: Query, options?: Options): Q.Promise<Selection>;
        public install(selection: Selection, options?: Options): Q.Promise<InstallResult>;
        private saveBundles(files, options);
        public reinstall(options?: Options): Q.Promise<InstallResult>;
        public update(options?: Options, version?: string): Q.Promise<InstallResult>;
        public getRateInfo(): Q.Promise<git.GitRateInfo>;
        public compare(query: Query): Q.Promise<CompareResult>;
        public browse(list: DefVersion[]): Q.Promise<string[]>;
        public visit(list: DefVersion[]): Q.Promise<string[]>;
        public purge(raw: boolean, api: boolean): Q.Promise<void>;
        public verbose : boolean;
    }
}
declare module xm {
    var parseStringMap: any;
    function parseStringTo(input: string, type: string): any;
}
declare module xm {
    function exposeSortIndex(one: ExposeCommand, two: ExposeCommand): number;
    function exposeSortHasElem(one: any[], two: any[], elem: any): number;
    function exposeSortId(one: ExposeCommand, two: ExposeCommand): number;
    function exposeSortGroup(one: ExposeGroup, two: ExposeGroup): number;
    function exposeSortOption(one: ExposeOption, two: ExposeOption): number;
    class ExposeLevel {
        static min: number;
        static med: number;
        static max: number;
    }
    class ExposeReporter {
        public output: StyledOut;
        public expose: Expose;
        constructor(expose: Expose, output?: StyledOut);
        public printCommands(level: string): void;
    }
}
declare module xm {
    class ExposeContext {
        public expose: Expose;
        public command: ExposeCommand;
        public argv: any;
        public out: StyledOut;
        constructor(expose: Expose, argv: any, command?: ExposeCommand);
        public hasOpt(name: string, strict?: boolean): any;
        public getOptRaw(name: string, alt?: any): any;
        public getOpt(name: string, alt?: any): any;
        public getOptAs(name: string, type: string, alt?: any): any;
        public getOptNames(strict?: boolean): string[];
        public getOptEnum(name: string, alt?: any): any;
        public getDefault(name: string, alt?: any): any;
        public isDefault(name: string): boolean;
        public getArgAt(index: number, alt?: any): any;
        public getArgAtAs(index: number, type: string, alt?: any): any;
        public getArgsAs(type: string): any[];
        public shiftArg(alt?: string): any;
        public shiftArgAs(type: string, alt?: string): any;
        public getArgs(alt?: string): any;
        public numArgs : number;
    }
}
declare module xm {
    interface ExposeHook {
        (ctx: ExposeContext): any;
    }
    interface ExposeHandle {
        (res: ExposeResult): any;
    }
    interface ExposeOptionApply {
        (value: any, ctx: ExposeContext): void;
    }
    interface ExposeResult {
        code: number;
        ctx: ExposeContext;
        error: ExposeError;
    }
    interface ExposeError extends Error {
    }
    interface ExposeSorter {
        (one: ExposeCommand, two: ExposeCommand): number;
    }
    class ExposeCommand {
        public name: string;
        public execute: ExposeHook;
        public index: number;
        public label: string;
        public hidden: boolean;
        public options: string[];
        public variadic: string[];
        public groups: string[];
        public examples: string[][];
        public note: string[];
        public internal: boolean;
        constructor();
    }
    class ExposeGroup {
        public name: string;
        public label: string;
        public index: number;
        public sorter: ExposeSorter;
        public options: string[];
        constructor();
    }
    class ExposeOption {
        public name: string;
        public description: string;
        public short: string;
        public type: string;
        public placeholder: string;
        public default: any;
        public command: string;
        public global: boolean;
        public optional: boolean;
        public enum: any[];
        public note: string[];
        public apply: ExposeOptionApply;
    }
    class Expose {
        public commands: Map<string, ExposeCommand>;
        public options: Map<string, ExposeOption>;
        public groups: Map<string, ExposeGroup>;
        public mainGroup: ExposeGroup;
        private _isInit;
        private _index;
        public reporter: ExposeReporter;
        public before: ExposeHook;
        public after: ExposeHook;
        public end: ExposeHandle;
        constructor(output?: StyledOut);
        public defineOption(build: (opt: ExposeOption) => void): void;
        public defineCommand(build: (cmd: ExposeCommand) => void): void;
        public defineGroup(build: (group: ExposeGroup) => void): void;
        public applyOptions(argv: any): ExposeContext;
        public init(): void;
        public validateOptions(opts: string[]): void;
        public exit(code: number): void;
        public executeArgv(argvRaw: any, alt?: string, exitAfter?: boolean): void;
        public executeRaw(argvRaw: any, alt?: string): Q.Promise<ExposeResult>;
        public executeCommand(name: string, ctx?: ExposeContext): Q.Promise<ExposeResult>;
    }
}
declare module tsd {
    module cli {
        class Printer {
            public output: xm.StyledOut;
            public indent: number;
            public skipProgress: RegExp[];
            private _remainingPrev;
            constructor(output: xm.StyledOut, indent?: number);
            public fmtSortKey(key: string): string;
            public fmtGitURI(str: string): string;
            public file(file: DefVersion, sep?: string): xm.StyledOut;
            public fileEnd(file: DefVersion, sep?: string): xm.StyledOut;
            public fileCommit(file: DefVersion, skipNull?: boolean): xm.StyledOut;
            public fileHead(file: DefVersion): xm.StyledOut;
            public fileInfo(file: DefVersion, skipNull?: boolean): xm.StyledOut;
            public dependencies(file: DefVersion): xm.StyledOut;
            public history(file: DefVersion): xm.StyledOut;
            public installResult(result: InstallResult): xm.StyledOut;
            public rateInfo(info: git.GitRateInfo, note?: boolean, force?: boolean): xm.StyledOut;
            public reportError(err: any, head?: boolean): xm.StyledOut;
            public reportProgress(obj: any): xm.StyledOut;
        }
    }
}
declare module tsd {
    module cli {
        function runUpdateNotifier(context: Context, promise?: boolean): Q.Promise<any>;
        function showUpdateNotifier(output: xm.StyledOut, context?: Context, promise?: boolean): Q.Promise<void>;
    }
}
declare module tsd {
    module cli {
        class Tracker {
            private _enabled;
            private _debug;
            private _accountID;
            private _client;
            private _context;
            private _minor;
            private _page;
            private _eventQueue;
            private _workers;
            private _workersMax;
            private _workersGrow;
            constructor();
            public init(context: Context, enabled?: boolean, debug?: boolean): void;
            public getPage(parts?: string[]): string;
            public pageview(...parts: string[]): void;
            public query(query: Query): void;
            public install(action: string, result: InstallResult): void;
            public browser(url: string): void;
            public visit(url: string): void;
            public error(err: any): void;
            public sendEvent(event?: any): void;
            private doEvent(event);
            public getTimer(variable: string, label?: string): (err?: any) => void;
            public client : UniversalAnalytics.Client;
            public enabled : boolean;
        }
        function getDummy(): any;
    }
}
declare module tsd {
    module cli {
        class StyleMap {
            public outputs: Set<xm.StyledOut>;
            private _styleMap;
            constructor(output: xm.StyledOut);
            public addOutput(output: xm.StyledOut): void;
            public getKeys(): string[];
            public useStyle(color: string, ctx: xm.ExposeContext): void;
        }
    }
}
declare module xm {
    function enumNames(enumer: Object): string[];
}
declare module tsd {
    module cli {
        module Opt {
            var version: string;
            var verbose: string;
            var style: string;
            var dev: string;
            var config: string;
            var cacheDir: string;
            var cacheMode: string;
            var resolve: string;
            var save: string;
            var bundle: string;
            var overwrite: string;
            var min: string;
            var max: string;
            var limit: string;
            var timeout: string;
            var commit: string;
            var semver: string;
            var date: string;
            var progress: string;
            var action: string;
            var info: string;
            var history: string;
            var detail: string;
            var services: string;
        }
        module Group {
            var primary: string;
            var query: string;
            var support: string;
            var help: string;
        }
        module Action {
            var install: string;
            var open: string;
            var browse: string;
            var visit: string;
            var compare: string;
            var update: string;
        }
    }
}
declare module tsd {
    module cli {
        function addCommon(expose: xm.Expose, print: Printer, style: StyleMap): void;
    }
}
declare module tsd {
    class Job {
        public ctx: xm.ExposeContext;
        public api: API;
        public context: Context;
        public query: Query;
        public options: Options;
    }
    interface JobSelectionAction {
        (ctx: xm.ExposeContext, job: Job, selection: Selection): Q.Promise<any>;
    }
    function getExpose(): xm.Expose;
    function runARGV(argvRaw: any): void;
}
declare module tsd {
    function getAPI(configPath: string, verbose?: boolean): API;
}
