declare module 'joi-assert' {
	import Joi = require('joi');

	function joiAssert<T>(value: T, schema: Joi.Schema, message?: string, vars?: Object): T;

	module joiAssert {
		interface JoiWrap<T> {
			(value: T, vars?: Object): T;
		}
		export function bake<T>(schema: Joi.Schema, message?: string): JoiWrap<T>;
	}

	export = joiAssert;
}
