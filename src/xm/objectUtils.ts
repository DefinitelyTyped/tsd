/// <reference path="./_ref.d.ts" />

'use strict';

import typeOf = require('./typeOf');

// just here for consistency
export function defineProp(object: Object, property: string, settings: any): void {
	Object.defineProperty(object, property, settings);
}

export function defineProps(object: Object, propertyNames: string[], settings: any): void {
	propertyNames.forEach((property: string) => {
		defineProp(object, property, settings);
	});
}

export function lockProps(object: Object, props?: string[], ownOnly: boolean = true) {
	if (!props) {
		Object.keys(object).forEach((property: string) => {
			Object.defineProperty(object, property, {writable: false});
		});
	}
	else {
		props.forEach((property: string) => {
			if (!ownOnly || typeOf.hasOwnProp(object, property)) {
				Object.defineProperty(object, property, {writable: false});
			}
		});
	}
}

export function lockPrimitives(object: Object): void {
	Object.keys(object).forEach((property: string) => {
		if (typeOf.isPrimitive(object[property])) {
			Object.defineProperty(object, property, {writable: false});
		}
	});
}
