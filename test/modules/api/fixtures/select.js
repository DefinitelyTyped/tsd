var lib = require('./lib');

var data = [
	{
		selector: { pattern: 'angular'},
		result: {
			nameMatches: [
				lib.defs.angular
			]
		}
	},
	{
		selector: { pattern: 'angular*/angular'},
		result: {
			nameMatches: [
				lib.defs.angular
			]
		}
	},
	{
		selector: { pattern: 'async'},
		result: {
			nameMatches: [
				lib.defs.async
			]
		}
	}
];
module.exports = data;