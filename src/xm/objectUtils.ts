/// <reference path="./_ref.d.ts" />

'use strict';

import typeOf = require('./typeOf');

// TODO remove some method clutter

// just here for consistency
export function defineProp(object: Object, property: string, settings: any): void {
	Object.defineProperty(object, property, settings);
}

export function defineProps(object: Object, propertyNames: string[], settings: any): void {
	propertyNames.forEach((property: string) => {
		defineProp(object, property, settings);
	});
}

export function hideProps(object: Object, props?: string[], pub: boolean = true, pref: boolean = true, own: boolean = true) {
	if (!props) {
		props = Object.keys(object);
	}
	props.forEach((property: string) => {
		if (own && !typeOf.hasOwnProp(object, property)) {
			return;
		}
		if (property.charAt(0) === '_') {
			if (pref) {
				Object.defineProperty(object, property, {enumerable: false});
			}
		}
		else if (pub) {
			Object.defineProperty(object, property, {enumerable: false});
		}
	});
}

export function lockProps(object: Object, props?: string[], pub: boolean = true, pref: boolean = true, own: boolean = true) {
	if (!props) {
		props = Object.keys(object);
	}
	props.forEach((property: string) => {
		if (own && !typeOf.hasOwnProp(object, property)) {
			return;
		}
		if (property.charAt(0) === '_') {
			if (pref) {
				Object.defineProperty(object, property, {writable: false});
			}
		}
		else if (pub) {
			Object.defineProperty(object, property, {writable: false});
		}
	});
}

export function freezeProps(object: Object, props?: string[], pub: boolean = true, pref: boolean = true, own: boolean = true) {
	if (!props) {
		props = Object.keys(object);
	}
	props.forEach((property: string) => {
		if (own && !typeOf.hasOwnProp(object, property)) {
			return;
		}
		if (property.charAt(0) === '_') {
			if (pref) {
				Object.defineProperty(object, property, {writable: false});
				Object.freeze(object[property]);
			}
		}
		else if (pub) {
			Object.defineProperty(object, property, {writable: false});
			Object.freeze(object[property]);
		}
	});
}

export function forceProps(object: Object, props: Object) {
	Object.keys(props).forEach((property: string) => {
		Object.defineProperty(object, property, {value: props[property], writable: false});
	});
}

export function lockPrimitives(object: Object): void {
	Object.keys(object).forEach((property: string) => {
		if (typeOf.isPrimitive(object[property])) {
			Object.defineProperty(object, property, {writable: false});
		}
	});
}
