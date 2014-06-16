/// <reference path="../_ref.d.ts" />

'use strict';

import miniwrite = require('miniwrite');
import ministyle = require('ministyle');

import assertVar = require('../../xm/assertVar');
import collection = require('../../xm/collection');
import StyledOut = require('../../xm/lib/StyledOut');
import ExposeContext = require('../../expose/Context');

class StyleMap {

	private _outputs = new collection.Set<StyledOut>();
	private _styleMap: collection.Hash<(ctx: ExposeContext) => void>;

	constructor(output: StyledOut) {
		assertVar(output, StyledOut, 'output');

		this.addOutput(output);

		this._styleMap = new collection.Hash<any>();

		this._styleMap.set('no', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.plain());
			});
		});
		this._styleMap.set('plain', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.plain());
			});
		});
		this._styleMap.set('ansi', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.ansi());
			});
		});
		this._styleMap.set('html', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.html(true));
				output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
			});
		});
		this._styleMap.set('css', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.css('', true));
				output.useWrite(miniwrite.htmlString(miniwrite.log(), 'span', {'class': 'cli'}, '<br/>'));
			});
		});
		this._styleMap.set('dev', (ctx: ExposeContext) => {
			this._outputs.forEach((output) => {
				output.useStyle(ministyle.dev());
			});
		});
	}

	addOutput(output: StyledOut) {
		this._outputs.add(output);
	}

	getStyles(): string[] {
		return this._styleMap.keys();
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
