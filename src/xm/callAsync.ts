module xm {
	export function callAsync(callback, ...args:any[]) {
		process.nextTick(() => {
			callback.apply(null, args);
		})
	};
}