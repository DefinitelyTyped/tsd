/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="DateUtil.ts" />
///<reference path="Logger.ts" />
///<reference path="inspect.ts" />
///<reference path="../../../typings/colors/colors.d.ts" />

module xm {
	'use strict';

	function padL(input, len, char) {
		var char = String(char).charAt(0);
		var input = String(input);
		while (input.length < len) {
			input = char + input;
		}
		return input;
	}

	//TODO make full dispatcher?
	export module logging {

		export class EventLog {
			private _items:EventLogItem[] = [];
			label:string;
			startAt:number;
			log:xm.Logger;
			parent:EventLog;
			listeners:EventLog[];

			logEnabled:boolean = false;
			countEnabled:boolean = false;

			constructor(log:xm.Logger, label:any) {
				this.label = label;
				this.log = log || xm.getLogger(this.label);
				this.startAt = Date.now();
			}

			event(type:string, message:string, data:any):EventLogItem {
				var item = new EventLogItem(type, message, data);
				if (this.countEnabled) {
					this._items.push(item);
				}
				if (this.logEnabled) {
					var msg = id;
					if (message) {
						msg += ' - ' + xm.inspect(message);
					}
					this.log.log(msg);
				}
				if (this.parent) {
					this.parent.event(id, message, data);
				}
				if (this.listeners) {
					for (var i = 0, ii = this.listeners.length; i < ii; i++) {
						this.listeners[i].event(id, message, data);
					}
				}
				return item;
			}

			getChild():EventLog {
				var log = new EventLog(this.log, this.label);
				log.parent = this;
				return log;
			}

			addListener(log:EventLog):void {
				if (log !== parent && this.listeners.indexOf(log) < 0) {
					this.listeners.push(log);
				}
			}

			removeListener(log:EventLog):void {
				var i = this.listeners.indexOf(log);
				if (i > -1) {
					this.listeners.splice(i, 1);
				}
			}

			getHistory():string[] {
				var date = new Date();
				//var toNiceUTC = xm.DateUtil.toNiceUTC;
				var memo = [];
				if (this.label) {
					memo.push(this.label + '(' + this._items.length + ')' + '\n');
				}
				return this._items.reduce((memo:string[], item:EventLogItem) => {
					date.time = this.startAt - item.time;
					var timeStr = padL((this.startAt - item.time), 8, '0');
					//filter items?
					memo.push(timeStr + ' ' + xm.inspect(item.message));
					return memo;
				}, memo);
			}

			getStats():{[type:string]:number} {
				var ret = {};
				this._items.forEach((id:string) => {
					if (ret.hasOwnProperty(id)) {
						ret[id] += 1;
					}
					else {
						ret[id] = 1;
					}
				});
				return ret;
			}

			getReport(label?:string):string {
				var ret = [];
				var stats = this.getStats();
				var keys = stats.keys();
				keys.sort();
				keys.forEach((id:string) => {
					ret.push(id + ': ' + stats[id]);
				});
				return (label ? label + ':\n' : '') + ret.join('\n');
			}
		}

		var index = 0;

		export class EventLogItem {
			time:number;
			index:number;

			constructor(public type:string, public message:any, public data:String) {
				this.time = Date.now();
				this.index = (++index);
			}

			toString():string {
				return this.type + ':' + this.message;
			}
		}
	}
}
