/// <reference path="./_ref.d.ts" />

import typeOf = require('./typeOf');

// TODO remove some method clutter

function deepFreezeRecursive(object: any, active: any[]): void {
	var value: any, prop: string;
	active = (active || []);
	active.push(object);
	Object.freeze(object);
	for (prop in object) {
		if (typeOf.hasOwnProp(object, prop)) {
			value = object[prop];
			if (typeOf.isObject(value) || typeOf.isArray(value)) {
				if (active.indexOf(object) < 0) {
					deepFreezeRecursive(value, active);
				}
			}
		}
	}
}

export function defineProp(object: Object, property: string, settings: any): void {
	Object.defineProperty(object, property, settings);
}

export function defineProps(object: Object, propertyNames: string[], settings: any): void {
	propertyNames.forEach((property: string) => {
		defineProp(object, property, settings);
	});
}

export function hidePrefixed(object: Object, ownOnly: boolean = true): void {
	for (var property in object) {
		if (property.charAt(0) === '_' && (!ownOnly || typeOf.hasOwnProp(object, property))) {
			defineProp(object, property, {enumerable: false});
		}
	}
}

export function hideProps(object: Object, props: string[]) {
	props.forEach((property: string) => {
		Object.defineProperty(object, property, {enumerable: false});
	});
}

export function lockProps(object: Object, props: string[], pub: boolean = true, pref: boolean = true) {
	props.forEach((property: string) => {
		if (/^_/.test(property)) {
			if (pref) {
				Object.defineProperty(object, property, {writable: false});
			}
		}
		else if (pub) {
			Object.defineProperty(object, property, {writable: false});
		}
	});
}

export function forceProps(object: Object, props: Object) {
	Object.keys(props).forEach((property: string) => {
		Object.defineProperty(object, property, {value: props[property], writable: false});
	});
}

export function freezeProps(object: Object, props: string[]) {
	props.forEach((property: string) => {
		Object.defineProperty(object, property, {writable: false});
		Object.freeze(object[property]);
	});
}

export function lockPrimitives(object: Object): void {
	Object.keys(object).forEach((property: string) => {
		if (typeOf.isPrimitive(object[property])) {
			Object.defineProperty(object, property, {writable: false});
		}
	});
}

export function deepFreeze(object: Object): void {
	if (typeOf.isObject(object) || typeOf.isArray(object)) {
		deepFreezeRecursive(object, []);
	}
}
