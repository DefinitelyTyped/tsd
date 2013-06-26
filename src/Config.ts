///<reference path='System/IO/FileManager.ts'/>
///<reference path='_ref.ts'/>

declare var unescape;

class Repo {
    public uriList:string[] = [];
}
interface IConfig {
    version:string ;
    typingsPath:string;
    repo:Repo;
    dependencies:any;
}


class Config implements IConfig {
    public static FILE_NAME = 'tsd-config.json';
    public static CORE_REPO = 'http://www.tsdpm.com/repository_v2.json';
    public static SCHEMA_PATH = require('path').resolve('./schema/tsd-config_v3.json');

    public version:string = "v3";
    public typingsPath:string;
    public repo:Repo;
    public dependencies:any = {};

    private static isNull(cfg:Object, key:string, alternativeValue:any):any{
        return cfg[key] ? cfg[key] : alternativeValue;
    }

    private static cascadeProp(key:string, cfg:any, defaults:any, alternativeValue?:any = null):any{
        if (cfg.hasOwnProperty(key)) {
            return cfg[key]
        }
        if (defaults.hasOwnProperty(key)) {
            return defaults[key]
        }
        return alternativeValue;
    }

    private static tryGetConfigFile():IConfig{
        var cfg:IConfig;
        try {
            cfg = JSON.parse(System.IO.FileManager.handle.readFile(Config.FILE_NAME));
        } catch (e) {
        }
        return cfg;
    }

    public static getDefault():IConfig{
        return <IConfig>{
            typingsPath: 'typings',
            dependencies: {},
            version: 'v3',
            repo: {
                uriList: [
                    Config.CORE_REPO
                ]
            }
        }
    }

    private tv4:TV4;
    private schema:any;

    constructor(){
        this.tv4 = require('tv4').tv4;
        this.schema = JSON.parse(System.IO.FileManager.handle.readFile(Config.SCHEMA_PATH));
    }

    public load(cfg?){
        var cfg = cfg || Config.tryGetConfigFile();

        var def = Config.getDefault();
        this.version = Config.cascadeProp('version', cfg, def);
        this.typingsPath = Config.cascadeProp('typingsPath', cfg, def);
        this.dependencies = Config.cascadeProp('dependencies', cfg, def);
        this.repo = Config.cascadeProp('repo', cfg, def);

        var res = this.tv4.validateResult(this, this.schema);
        if (!res.valid) {
            throw (new Error(res.error.message + ' -> ' + res.error.dataPath + ' -> ' + res.error.schemaPath));
        }
    }

    public save(){
        var dep = {};
        for (var attr in this.dependencies) {
            if (this.dependencies.hasOwnProperty(attr)) {
                dep[attr] = this.dependencies[attr];
            }
        }

        var cfg:IConfig = {
            typingsPath: this.typingsPath,
            repo: this.repo,
            version: this.version,
            dependencies: dep
        };
        var res = this.tv4.validateResult(cfg, this.schema);
        if (!res.valid) {
            throw (new Error(res.error.message + ' -> ' + res.error.dataPath + ' -> ' + res.error.schemaPath));
        }
        System.IO.FileManager.handle.writeFile(Config.FILE_NAME, JSON.stringify(cfg, null, 4));
    }

    public addDependency(name:string, version:string, key:string, uri:string, repo:string){
        this.dependencies[name + '@' + version] = { repo: repo, key: key, uri: uri };
    }
}