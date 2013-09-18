var data = [
	{
		pattern: 'angular',
		result: ['angularjs/angular.d.ts' ]
	},
	{
		pattern: 'angularjs/angular',
		result: ['angularjs/angular.d.ts' ]
	},
	{
		pattern: 'angular*/angular',
		result: ['angularjs/angular.d.ts' ]
	},
	{
		pattern: 'async',
		result: ['async/async.d.ts' ]
	},
	{
		pattern: 'async/*',
		result: ['async/async.d.ts']
	},
	{
		pattern: '*/async',
		result: ['async/async.d.ts']
	},
	{
		pattern: 'async/asy*',
		result: ['async/async.d.ts']
	},
	{
		pattern: 'async/*asy*',
		result: ['async/async.d.ts']
	},
	{
		pattern: '*sync/async',
		result: ['async/async.d.ts']
	},
	{
		pattern: '*syn*/async',
		result: ['async/async.d.ts']
	},
];
module.exports = {
	data:data,
	source: require('./paths-many.json')
};