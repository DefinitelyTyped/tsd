declare module 'lockfile' {
	export interface Options {
		wait?: number;
		stale?: number;
		retries?: number;
		retryWait?: number;
	}

	export function lock(path: string, opts: Options, callback: (err: Error) => void): void;
	export function lock(path: string, callback: (err: Error) => void): void;
	export function lockSync(path: string, opts: Options):void;

	export function unlock(path: string, callback: (err: Error) => void): void;
	export function unlockSync(path: string):void;

	export function check(path: string, opts: Options, callback: (err: Error) => void): void;
	export function check(path: string, callback: (err: Error) => void): void;
	export function checkSync(path: string, opts: Options): boolean;
}
