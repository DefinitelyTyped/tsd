///<reference path="../_ref.ts" />
///<reference path="DefVersion.ts" />

module tsd {
	'use strict';


	/*
	 Def: single definition in repo (identified by its path)
	 */
	export class Def {

		//static nameExp = /^([a-z](?:[\._\-]*[a-z0-9]+)*)\/([a-z](?:[\._\-]*[a-z0-9]+)*)\.d\.ts$/i;
		//static nameExpEnd = /([a-z](?:[\._\-]*[a-z0-9]+)*)\/([a-z](?:[\._\-]*[a-z0-9]+)*)\.d\.ts$/i;

		static nameExp = /^([a-z](?:[a-z0-9\._-]*?[a-z0-9])?)\/([a-z](?:[a-z0-9\._-]*?[a-z0-9])?)\.d\.ts$/i;
		static nameExpEnd = /([a-z](?:[a-z0-9\._-]*?[a-z0-9])?)\/([a-z](?:[a-z0-9\._-]*?[a-z0-9])?)\.d\.ts$/i;

		// unique identifier: 'project/name' (should support 'project/name-v0.1.3-alpha')
		path:string;

		// split
		project:string;
		name:string;
		//used?
		semver:string;

		//version from the DefIndex commit +tree (may be not our edit)
		head:tsd.DefVersion;

		//versions from commits that changed this file
		history:tsd.DefVersion[] = [];

		constructor(path:string) {
			xm.assertVar(path, 'string', 'path');
			this.path = path;
		}

		get pathTerm():string {
			return this.path.replace(/\.d\.ts$/, '');
		}

		toString():string {
			return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
		}

		static getPathExp(trim:boolean):RegExp {
			var useExp:RegExp = (trim ? Def.nameExpEnd : Def.nameExp);
			useExp.lastIndex = 0;
			return useExp;
		}

		static isDefPath(path:string, trim:boolean = false):boolean {
			return Def.getPathExp(trim).test(path);
		}

		static getFileFrom(path:string):string {
			var useExp:RegExp = Def.getPathExp(true);
			var match = useExp.exec(path);
			if (!match) {
				return null;
			}
			return match[1] + '/' + match[2] + '.d.ts';
		}

		static getFrom(path:string, trim:boolean = false):tsd.Def {
			var useExp:RegExp = Def.getPathExp(trim);

			var match:RegExpExecArray = useExp.exec(path);
			if (!match) {
				return null;
			}
			if (match.length < 1) {
				return null;
			}
			if (match[1].length < 1 || match[2].length < 1) {
				return null;
			}
			var file = new tsd.Def(path);
			file.project = match[1];
			file.name = match[2];

			xm.ObjectUtil.lockProps(file, ['path', 'project', 'name']);

			//TODO support semver postfix 'project/name-v0.1.3-alpha'
			// path.semver = match[3];

			return file;
		}
	}
}
