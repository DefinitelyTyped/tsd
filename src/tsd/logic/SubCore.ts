///<reference path="../../_ref.d.ts" />
///<reference path="../../xm/assertVar.ts" />
///<reference path="../../xm/Logger.ts" />
///<reference path="../Core.ts" />

module tsd {
	'use strict';

	export class SubCore {

		core:tsd.Core;
		track:xm.EventLog;
		private _verbose:boolean = false;

		constructor(core:tsd.Core, track:string, label:string) {
			xm.assertVar(core, tsd.Core, 'core');
			this.core = core;
			this.track = new xm.EventLog(track, label);

			xm.ObjectUtil.lockProps(this, ['core', 'track']);
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
		}

		get verbose():boolean {
			return this._verbose;
		}
	}
}
