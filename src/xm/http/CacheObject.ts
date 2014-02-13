/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../../_ref.d.ts" />
/// <reference path="../object.ts" />
/// <reference path="../promise.ts" />
/// <reference path="../EventLog.ts" />
/// <reference path="../hash.ts" />
/// <reference path="../typeOf.ts" />
/// <reference path="../json-schema.ts" />
/// <reference path="../file.ts" />
/// <reference path="../Koder.ts" />
/// <reference path="../data/PackageJSON.ts" />
/// <reference path="CacheStreamLoader.ts" />
/// <reference path="CacheMode.ts" />

module xm {
	'use strict';

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export module http {

		// single request, hashes to a unique id
		export class CacheRequest {
			key:string;
			locked:boolean;

			url:string;
			headers:any;

			localMaxAge:number;
			httpInterval:number;
			forceRefresh:boolean;

			static lockProps:string[] = [
				'key',
				'url',
				'headers',
				'localMaxAge',
				'httpInterval',
				'forceRefresh',
				'locked'
			];
			static keyHeaders:string[] = [
				'accept',
				'accept-charset',
				'accept-language',
				'content-md5',
				'content-type',
				'cookie',
				'host'
			];

			constructor(url:string, headers?:any) {
				this.url = url;
				this.headers = headers || {};
			}

			lock():CacheRequest {
				this.locked = true;

				var keyHash = {
					url: this.url,
					headers: Object.keys(this.headers).reduce((memo:any, key:string) => {
						if (CacheRequest.keyHeaders.indexOf(key) > -1) {
							memo[key] = this.headers[key];
						}
						return memo;
					}, Object.create(null))
				};
				this.key = xm.jsonToIdentHash(keyHash);
				xm.object.lockProps(this, CacheRequest.lockProps);
				// TODO maybe we should clone before freeze?
				xm.object.deepFreeze(this.headers);
				return this;
			}
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		// a represent a single object in the cache
		export class CacheObject {
			request:CacheRequest;
			storeDir:string;

			infoFile:string;
			info:CacheInfo;

			response:ResponseInfo;

			bodyFile:string;
			bodyChecksum:string;
			body:NodeBuffer;

			constructor(request:CacheRequest) {
				this.request = request;
			}
		}

		// hold some interesting meta data
		export class ResponseInfo {
			status:number = 0;
			headers:any = {};
		}

		// meta data to keep on disk
		export interface CacheInfo {
			url:string;
			key:string;
			contentType:string;
			httpETag:string;
			httpModified:string;
			cacheCreated:string;
			cacheUpdated:string;
			contentChecksum:string;
		}

		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

		export interface IObjectValidator {
			assert(object:CacheObject):void
		}

		export class SimpleValidator implements IObjectValidator {
			assert(object:CacheObject):void {
				xm.assert(xm.isValid(object.body), 'body valid');
			}

			static main = new SimpleValidator();
		}


		export class CacheValidator implements IObjectValidator {

			constructor(public schema) {
			}

			assert(object:CacheObject):void {
				xm.assertJSONSchema(object.info, this.schema);
			}
		}

		export class CacheAgeValidator implements IObjectValidator {
			maxAgeMili:number = 0;

			constructor(public schema, maxAgeMili?:number) {
				this.maxAgeMili = maxAgeMili;
			}

			assert(object:CacheObject):void {
				xm.assertJSONSchema(object.info, this.schema);

				var date:Date = new Date(object.info.cacheUpdated);
				if (xm.isNumber(this.maxAgeMili)) {
					var compare = new Date();
					xm.assert(date.getTime() < compare.getTime() + this.maxAgeMili, 'checksum {a} vs {e}', date.toISOString(), compare.toISOString());
				}
			}
		}

		export class ChecksumValidator implements IObjectValidator {
			assert(object:CacheObject):void {
				xm.assertVar(object.body, Buffer, 'body');
				xm.assertVar(object.bodyChecksum, 'sha1', 'bodyChecksum');
				xm.assertVar(object.info.contentChecksum, 'sha1', 'contentChecksum');
				xm.assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
			}
		}
	}
}
