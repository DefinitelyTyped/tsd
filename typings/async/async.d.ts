// Type definitions for Async 0.1.23
// Project: https://github.com/caolan/async
// Definitions by: Boris Yankov <https://github.com/borisyankov/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface AsyncMultipleResultsCallback<T> { (err: Error, results: T[]): any; }
//interface AsyncMultipleResultsCallback<T> { (err: string, results: T[]): any; }
interface AsyncSingleResultCallback<T> { (err: Error, result: T): any; }
//interface AsyncSingleResultCallback<T> { (err: string, result: T): any; }
interface AsyncTimesCallback<T> { (n: number, callback: AsyncMultipleResultsCallback<T>): void; }
interface AsyncIterator<T> { (item: T, callback: AsyncMultipleResultsCallback<T>): void; }
interface AsyncMemoIterator<T> { (memo: T, item: T, callback: AsyncSingleResultCallback<T>): void; }
interface AsyncWorker<T> { (task: T, callback: Function): void; }

interface AsyncQueue<T> {
    length(): number;
    concurrency: number;
    push(task: T, callback?: AsyncMultipleResultsCallback<T>): void;
    saturated: AsyncMultipleResultsCallback<T>;
    empty: AsyncMultipleResultsCallback<T>;
    drain: AsyncMultipleResultsCallback<T>;
}

interface Async {

    // Collections
    forEach<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    forEachSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    forEachLimit<T>(arr: T[], limit: number, iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    map<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    mapSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    filter<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    select<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    filterSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    selectSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    reject<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    rejectSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    reduce<T>(arr: T[], memo: T, iterator: AsyncMemoIterator<T>, callback: AsyncSingleResultCallback<T>): void;
    inject<T>(arr: T[], memo: T, iterator: AsyncMemoIterator<T>, callback: AsyncSingleResultCallback<T>): void;
    foldl<T>(arr: T[], memo: T, iterator: AsyncMemoIterator<T>, callback: AsyncSingleResultCallback<T>): void;
    reduceRight<T>(arr: T[], memo: T, iterator: AsyncMemoIterator<T>, callback: AsyncSingleResultCallback<T>): void;
    foldr<T, U>(arr: T[], memo: T, iterator: AsyncMemoIterator<T>, callback: AsyncSingleResultCallback<T>): void;
    detect<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    detectSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    sortBy<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    some<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    any<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    every<T>(arr: T[], iterator: AsyncIterator<T>, callback: (result: boolean) => any): void;
    all<T>(arr: T[], iterator: AsyncIterator<T>, callback: (result: boolean) => any): void;
    concat<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;
    concatSeries<T>(arr: T[], iterator: AsyncIterator<T>, callback: AsyncMultipleResultsCallback<T>): void;

    // Control Flow
    series<T>(tasks: T[], callback?: AsyncMultipleResultsCallback<T>): void;
    series<T>(tasks: T, callback?: AsyncMultipleResultsCallback<T>): void;
    parallel<T>(tasks: T[], callback?: AsyncMultipleResultsCallback<T>): void;
    parallel<T>(tasks: T, callback?: AsyncMultipleResultsCallback<T>): void;
    whilst(test: Function, fn: Function, callback: Function): void;
    until(test: Function, fn: Function, callback: Function): void;
    waterfall<T>(tasks: T[], callback?: AsyncMultipleResultsCallback<T>): void;
    waterfall<T>(tasks: T, callback?: AsyncMultipleResultsCallback<T>): void;
    queue<T>(worker: AsyncWorker<T>, concurrency: number): AsyncQueue<T>;
    // auto(tasks: any[], callback?: AsyncMultipleResultsCallback<T>): void;
    auto(tasks: any, callback?: AsyncMultipleResultsCallback<any>): void;
    iterator(tasks: Function[]): Function;
    apply(fn: Function, ...arguments: any[]): void;
    nextTick<T>(callback: Function): void;

    times<T> (n: number, callback: AsyncTimesCallback<T>): void;
    timesSeries<T> (n: number, callback: AsyncTimesCallback<T>): void;

    // Utils
    memoize(fn: Function, hasher?: Function): Function;
    unmemoize(fn: Function): Function;
    log(fn: Function, ...arguments: any[]): void;
    dir(fn: Function, ...arguments: any[]): void;
    noConflict(): Async;
}

declare var async: Async;

declare module "async" {
	export = async;
}
