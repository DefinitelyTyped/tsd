/// <reference path="../_ref.d.ts" />

'use strict';

import ua = require('universal-analytics');
import uuid = require('uuid');
import urlMod = require('url');

import log = require('../../xm/log');
import assertVar = require('../../xm/assertVar');

import Query = require('../select/Query');
import NameMatcher = require('../select/NameMatcher');
import InstallResult = require('../logic/InstallResult');
import Context = require('../context/Context');
import DefVersion = require('../data/DefVersion');

class Tracker {

	private _enabled: boolean;
	private _debug: boolean;
	private _accountID: string;
	private _client: ua.Client = getDummy();
	private _context: Context;
	private _minor: string;
	private _page: string;
	private _eventQueue: any[] = [];
	private _workers: any[] = [];
	private _workersMax: number = 50;
	private _workersGrow: number = 10;

	constructor() {
	}

	init(context: Context, enabled: boolean = true, debug: boolean = false): void {
		assertVar(context, Context, 'context');
		assertVar(enabled, 'boolean', 'enabled');

		this._context = context;
		this._enabled = enabled;
		this._debug = debug;

		this._accountID = context.settings.getString('tracker/accountID');
		this._enabled = context.settings.getBoolean('tracker/enabled');

		this._minor = this._context.packageInfo.version.match(/^\d+\.\d+/)[0];
		this._page = [
			'',
			this._context.packageInfo.name,
			this._context.packageInfo.version,
			this._context.config.repoOwner,
			this._context.config.repoProject,
			this._context.config.ref
		].join('/');

		if (!this._enabled) {
			return;
		}
		if (!this._accountID || !/^UA-\d+-\d+$/.test(this._accountID)) {
			throw new Error('invalid accountID: ' + this._accountID);
		}
		// force anonymous
		this._client = ua(this._accountID, uuid.v4());
		if (this._debug) {
			this._client = this._client.debug();
		}
	}

	getPage(parts?: string[]): string {
		return this._page + (parts && parts.length > 0 ? '/' + parts.join('/') : '');
	}

	pageview(...parts: string[]): void {
		this._client.pageview(this.getPage(parts)).send();
	}

	query(query: Query): void {
		this.sendEvent({
			ec: 'query',
			ea: query.patterns.map((matcher: NameMatcher) => {
				return matcher.pattern;
			}).join(' '),
			dp: this.getPage()
		});
	}

	install(action: string, result: InstallResult): void {
		result.written.forEach((value: DefVersion) => {
			this.sendEvent({
				ec: action,
				ea: value.def.path,
				dp: this.getPage()
			});
		});
	}

	browser(url: string): void {
		var parts = urlMod.parse(url);
		this.sendEvent({
			ec: 'browser',
			ea: (parts.path + (parts.hash || '')),
			dp: this.getPage()
		});
	}

	visit(url: string): void {
		this.sendEvent({
			ec: 'visit',
			ea: url,
			dp: this.getPage()
		});
	}

	error(err: any): void {
		if (err) {
			if (err.message) {
				this._client.exception(err.message).send();
			}
			else {
				this._client.exception(String(err)).send();
			}
		}
	}

	sendEvent(event?: any): void {
		if (!this._enabled) {
			return;
		}
		if (event) {
			this._eventQueue.push(event);
		}
		// sanity limit
		var grow = 0;
		while (this._eventQueue.length > 0 && this._workers.length < this._workersMax && grow < this._workersGrow) {
			// for closure
			this.doEvent(this._eventQueue.pop());
			grow++;
		}
	}

	private doEvent(event): void {
		this._workers.push(event);
		if (this._debug) {
			log.debug('event', event);
		}
		this._client.event(event, (err) => {
			var i = this._workers.indexOf(event);
			if (i > -1) {
				this._workers.splice(i, 1);
			}
			if (!err) {
				this.sendEvent();
			}
		});
	}

	getTimer(variable: string, label?: string): (err?: any) => void {
		if (!this._enabled) {
			return (err?: any) => {
				// noop
			};
		}
		var start = Date.now();
		return (err?: any) => {
			if (!err) {
				var duration = Date.now() - start;
				if (this._debug) {
					log.debug('timer', duration + 'ms');
				}
				this._client.timing(this.getPage(), variable, duration, label).send();
			}
		};
	}

	get client(): ua.Client {
		return this._client;
	}

	get enabled(): boolean {
		return this._enabled;
	}

	set enabled(enabled: boolean) {
		if (enabled !== this._enabled) {
			this._enabled = enabled;
			if (this._debug) {
				log.status('Tracker ' + (this._enabled ? 'enabled' : 'disabled'));
			}
		}
	}
}

function getDummy(): any {
	var dummy = {
		debug: function () {
			return dummy;
		},
		send: function () {
			return dummy;
		},
		pageview: function () {
			return dummy;
		},
		event: function () {
			return dummy;
		},
		transaction: function () {
			return dummy;
		},
		item: function () {
			return dummy;
		},
		exception: function () {
			return dummy;
		},
		timing: function () {
			return dummy;
		}
	};
	return dummy;
}

export = Tracker;
