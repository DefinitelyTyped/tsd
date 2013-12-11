///<reference path="../_ref.ts" />
///<reference path="../../xm/expose/ExposeContext.ts" />
///<reference path="../../xm/io/StyledOut.ts" />

module tsd {

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle> require('ministyle');

	export module cli {

		export class StyleMap {

			outputs:xm.StyledOut[] = [];
			_styleMap:Map<string, (ctx:xm.ExposeContext) => void>;

			constructor(output:xm.StyledOut) {
				xm.assertVar(output, xm.StyledOut, 'output');

				this.addOutput(output);

				this._styleMap = new Map();

				this._styleMap.set('no', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.plain());
					});
				});
				this._styleMap.set('plain', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.plain());
					});
				});
				this._styleMap.set('ansi', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.ansi());
					});
				});
				this._styleMap.set('html', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.html(true));
						output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
					});
				});
				this._styleMap.set('css', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.css('', true));
						output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
					});
				});
				this._styleMap.set('dev', (ctx:xm.ExposeContext) => {
					this.outputs.forEach((output) => {
						output.useStyle(ministyle.dev());
					});
				});
			}

			addOutput(output:xm.StyledOut) {
				if (this.outputs.indexOf(output) < 0) {
					this.outputs.push(output);
				}
			}

			getKeys():string[] {
				return xm.keysOf(this._styleMap);
			}

			useColor(color:string, ctx:xm.ExposeContext) {
				if (this._styleMap.has(color)) {
					this._styleMap.get(color)(ctx);
				}
				else {
					this._styleMap.get('plain')(ctx);
				}
			}
		}
	}
}
