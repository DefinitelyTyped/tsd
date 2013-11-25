// Type definitions for semver v2.2.1
// Project: https://github.com/isaacs/node-semver
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module SemverModule {

	function valid(v:string, loose?:boolean):string; // Return the parsed version, or null if it's not valid.
	//TODO maybe add an enum for release?
	function inc(v:string, release:string, loose?:boolean):string; // Return the version incremented by the release type (major, minor, patch, or prerelease), or null if it's not valid.

	//Comparison
	function gt(v1:string, v2:string, loose?:boolean):boolean; // v1 > v2
	function gte(v1:string, v2:string, loose?:boolean):boolean; // v1 >= v2
	function lt(v1:string, v2:string, loose?:boolean):boolean; // v1 < v2
	function lte(v1:string, v2:string, loose?:boolean):boolean; // v1 <= v2
	function eq(v1:string, v2:string, loose?:boolean):boolean; // v1 == v2 This is true if they're logically equivalent, even if they're not the exact same string. You already know how to compare strings.
	function neq(v1:string, v2:string, loose?:boolean):boolean; // v1 != v2 The opposite of eq.
	function cmp(v1:string, comparator, v2:string, loose?:boolean):boolean; // Pass in a comparison string, and it'll call the corresponding function above. "===" and "!==" do simple string comparison, but are included for completeness. Throws if an invalid comparison string is provided.
	function compare(v1:string, v2:string, loose?:boolean):number; // Return 0 if v1 == v2, or 1 if v1 is greater, or -1 if v2 is greater. Sorts in ascending order if passed to Array.sort().
	function rcompare(v1:string, v2:string, loose?:boolean):number; // The reverse of compare. Sorts an array of versions in descending order when passed to Array.sort().

	//Ranges
	function validRange(range:string, loose?:boolean):string; // Return the valid range or null if it's not valid
	function satisfies(version:string, range:string, loose?:boolean):string; // Return true if the version satisfies the range.
	function maxSatisfying(versions:string, range:string, loose?:boolean):string; // Return the highest version in the list that satisfies the range, or null if none of them do.
	function gtr(version:string, range:string, loose?:boolean):boolean; // Return true if version is greater than all the versions possible in the range.
	function ltr(version:string, range:string, loose?:boolean):boolean; // Return true if version is less than all the versions possible in the range.
	function outside(version:string, range:string, hilo:string, loose?:boolean):boolean; // Return true if the version is outside the bounds of the range in either the high or low direction. The hilo argument must be either the string '>' or '<'. (This is the function called by gtr and ltr.)

	interface SemverBase {
		raw:string;
		loose:boolean;
		format():string;
		inspect():string;
		toString():string;
	}

	interface Semver extends SemverBase {
		new(version:string, loose?:boolean):Semver;
		major:number;
		minor:number;
		patch:number;
		version:string;
		build:string[];
		prerelease:string[];

		compare(other:Semver):number;
		compareMain(other:Semver):number;
		comparePre(other:Semver):number;
		inc(release:string):Semver;
	}

	interface Comparator extends SemverBase {
		new(comp:string, loose?:boolean):Comparator;
		semver:Semver;
		operator:string;
		value:boolean;
		parse(comp) :void;
		test(version):boolean;
	}
	interface Range extends SemverBase {
		new(range:string, loose?:boolean):Range;
		set:Comparator[][];
		parseRange(range):Comparator[];
		test(version):boolean;
	}
}
declare module "semver" {
export = SemverModule;
}
