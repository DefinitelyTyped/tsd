///<reference path='../../_ref.ts' />

///<reference path='../../../src/tsd/Selector.ts' />
///<reference path='../../../src/xm/iterate.ts' />

describe('Selector', function () {

	var fs = require('fs');
	var path = require('path');
	var rimraf = require('rimraf');

	var _:UnderscoreStatic = <UnderscoreStatic>require('underscore');

	describe('Selector', () => {

		before(() => {

		});

		describe('basics', () => {

			it('is defined', () => {
				//assert.ok(tsd.Selector);
			});
		});

		/*describe('selects', () => {
			var selectors = {
				'async': {
					files: ['async/async.d.ts']
				},
				'async/async': {
					files: ['async/async.d.ts']
				},
				'gapi.youtube': {
					files: ['gapi.youtube/gapi.youtube.d.ts']
				}
			};


			var testSelector = (selector:string, data:any) => {

			};

			xm.eachProp(selectors, (value:any, selector:string) => {
				it('selector ' + selector + '', () => {

				});
			});
		}); //*/
	});
});
