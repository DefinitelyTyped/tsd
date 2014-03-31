/// <reference path="../_ref.d.ts" />

'use strict';

import miniwrite = require('miniwrite');
import ministyle = require('ministyle');

import assertVar = require('../../xm/assertVar');
import collection = require('../../xm/collection');
import StyledOut = require('../../xm/lib/StyledOut');
import ExposeContext = require('../../xm/expose/ExposeContext');

class StyleMap {

	outputs = new Set<StyledOut>();
	private _styleMap: Map<string, (ctx: ExposeContext) => void>;

	constructor(output: StyledOut) {
		assertVar(output, StyledOut, 'output');

		this.addOutput(output);

		this._styleMap = new Map<any, any>();

		this._styleMap.set('no', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.plain());
			});
		});
		this._styleMap.set('plain', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.plain());
			});
		});
		this._styleMap.set('ansi', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.ansi());
			});
		});
		this._styleMap.set('html', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.html(true));
				output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
			});
		});
		this._styleMap.set('css', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.css('', true));
				output.useWrite(miniwrite.htmlString(miniwrite.log(), 'span', {'class': 'cli'}, '<br/>'));
			});
		});
		this._styleMap.set('dev', (ctx: ExposeContext) => {
			this.outputs.forEach((output) => {
				output.useStyle(ministyle.dev());
			});
		});
	}

	addOutput(output: StyledOut) {
		this.outputs.add(output);
	}

	getKeys(): string[] {
		return collection.keysOf(this._styleMap);
	}

	useStyle(color: string, ctx: ExposeContext) {
		if (this._styleMap.has(color)) {
			this._styleMap.get(color)(ctx);
		}
		else {
			this._styleMap.get('plain')(ctx);
		}
	}
}

export = StyleMap;
