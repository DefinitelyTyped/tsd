declare module 'update-notifier' {
	function updateNotifier(opts?: updateNotifier.Settings): updateNotifier.Info;

	module updateNotifier {
		export var update: Info;
		export function notify(msg?: string): void;
		export function notify(defer: boolean): void;

		export interface Info {
			// semver
			latest: string;
			// semver
			current: string;
			// possible values: latest, major, minor, patch
			type: string;
			// iso string
			date: string;
			// package name
			name: string;
		}

		export interface Settings {
			// If provided, a callback function will be called, passed (error[, update])
			callback?: (err: any, update?: Info) => void;
			// Relative path to your module package.json.
			packagePath?: string;
			// Used instead of inferring it from packageFile.
			// Requires you to also specify packageVersion.
			packageName?: string;
			// Used instead of inferring it from packageFile.
			// Requires you to also specify packageName.
			packageVersion?: string;
			// How often it should check for updates.
			updateCheckInterval?: number;
			// How long the update can take.
			// If it takes longer than the timeout, it will be aborted.
			updateCheckTimeout?: number;
			// Alternative registry mirrors:
			registryUrl?: string;
		}
	}
	export = updateNotifier;
}
