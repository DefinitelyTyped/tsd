/// <reference path="../_ref.d.ts" />

import WeakMap = require('weak-map');
import detectIndent = require('detect-indent');

import CodeStyle = require('../lib/CodeStyle');
import assert = require('../assert');
import JSONStabilizer = require('./JSONStabilizer');

/**
 * JSONStabilizerMap - weakly associate JSONStabilizer's and their objects
 */
class JSONStabilizerMap {

	depth: number;
	style: CodeStyle;

	map = new WeakMap<Object, JSONStabilizer>();

	constructor(depth: number = 2, style: CodeStyle = null) {
		this.depth = depth;
		this.style = style || new CodeStyle();
	}

	/**
	 * parse string to an object and sniff/snapshot and associate
	 */
	parseString(jsonString: string): Object {
		var stable: JSONStabilizer = new JSONStabilizer(this.depth, this.style.clone());
		var object = stable.parseString(jsonString);
		this.map.set(object, stable);
		return object;
	}

	/**
	 *  associate existing object
	 */
	associate(object: Object, snapshotNow: boolean = true): JSONStabilizer {
		var stable: JSONStabilizer;
		if (!this.map.has(object)) {
			stable = new JSONStabilizer(this.depth, this.style.clone());
			this.map.set(object, stable);
		}
		else {
			stable = this.map.get(object);
		}
		if (snapshotNow) {
			stable.snapshot(object);
		}
		return stable;
	}

	/**
	 * wrapper: convert object to stabilized string
	 */
	toJSONString(object: Object): string {
		var stable: JSONStabilizer;
		if (!this.map.has(object)) {
			stable = new JSONStabilizer(this.depth, this.style.clone());
			this.map.set(object, stable);
			stable.snapshot(object);
		}
		else {
			stable = this.map.get(object);
		}
		return stable.toJSONString(object);
	}
}

export = JSONStabilizerMap;
