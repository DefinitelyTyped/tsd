///<reference path="_ref.ts" />
///<reference path="typeOf.ts" />

module xm {

	export class ObjectUtil {
		//lazy alias for consistency
		static defineProp(object:Object, property:string, settings:any):void {
			Object.defineProperty(object, property, settings);
		}

		static defineProps(object:Object, propertyNames:string[], settings:any):void {
			propertyNames.forEach((property:string) => {
				ObjectUtil.defineProp(object, property, settings);
			});
		}

		static hidePrefixed(object:Object, ownOnly:bool = true):void {
			for (var property in object) {
				if (property.charAt(0) === '_' && (!ownOnly || object.hasOwnProperty(property))) {
					ObjectUtil.defineProp(object, property, {enumerable: false});
				}
			}
		}

		static hideFunctions(object:Object):void {
			for (var property in object) {
				if (xm.isFunction(object)) {
					ObjectUtil.defineProp(object, property, {enumerable: false});
				}
			}
		}
	}
}