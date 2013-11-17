///<reference path="../../src/xm/typeOf.ts" />

module xm {

	var jsonpointer = require('json-pointer');

	//copied from chai-json-schema
	export module tv4 {

		//make a compact debug string from any object
		function valueStrim(value, strimLimit:number = 60):string {

			var t = typeof value;
			if (t === 'function') {
				return '[function]';
			}
			if (t === 'object') {
				value = JSON.stringify(value);
				if (value.length > strimLimit) {
					value = value.substr(0, strimLimit) + '...';
				}
				return value;
			}
			if (t === 'string') {
				if (value.length > strimLimit) {
					return JSON.stringify(value.substr(0, strimLimit)) + '...';
				}
				return JSON.stringify(value);
			}
			return '' + value;
		}

		function extractSchemaLabel(schema, max:number = 80):string {
			var label = '';
			if (schema.id) {
				label = schema.id;
			}
			if (schema.title) {
				label += (label ? ' (' + schema.title + ')' : schema.title);
			}
			if (!label && schema.description) {
				label = valueStrim(schema.description, max);
			}
			if (!label) {
				label = valueStrim(schema, max);
			}
			return label;
		}

		//print validation errors
		function formatResult(into, error, data, schema, indent):void {
			var schemaValue;
			var dataValue;
			var schemaLabel;

			//assemble error string
			into.push(indent + error.message);

			schemaLabel = extractSchemaLabel(schema, 80);
			if (schemaLabel) {
				into.push(indent + '    schema: ' + schemaLabel);
			}
			if (error.schemaPath) {
				schemaValue = jsonpointer.get(schema, error.schemaPath);
				into.push(indent + '    rule:   ' + error.schemaPath + ' -> ' + valueStrim(schemaValue));
			}
			if (error.dataPath) {
				dataValue = jsonpointer.get(data, error.dataPath);
				into.push(indent + '    field:  ' + error.dataPath + ' -> ' + xm.typeOf(dataValue) + ': ' + valueStrim(dataValue));
			}

			//go deeper
			/*if (error.subErrors) {
			 forEachI(error.subErrors, function (error) {
			 ret += formatResult(into, error, data, schema, indent + indent);
			 });
			 }*/
		}

		export function getReport(obj, schema, result):string[] {

			//assemble readable message
			var label = extractSchemaLabel(schema, 30);

			var details = [];
			if (!result) {
				details.push('no result matched: ' + label);
			}
			else {
				if (result.valid) {
					details.push('schema matched: ' + label);
				}
				else {
					details.push('schema NOT matched: ' + label + ' -> ' + valueStrim(obj, 30));

					var indent = '      ';
					if (result.error) {
						details.push(formatResult(details, result.error, obj, schema, indent));
					}
					else if (result.errors) {
						result.errors.forEach(function (error) {
							details.push(formatResult(details, error, obj, schema, indent));
						});
					}
				}
				//missing
				if (result.missing.length === 1) {
					details.push('missing 1 schema: ' + extractSchemaLabel(result.missing[0]));
				}
				else if (result.missing.length > 0) {
					details.push('missing ' + result.missing.length + ' schemas:');
					result.missing.forEach(function (missing) {
						details.push(extractSchemaLabel(missing));
					});
				}
			}
			return details;
		}
	}
}
