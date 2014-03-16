import Const = require('../context/Const');

export function shaShort(sha: string): string {
	if (!sha) {
		return '<no sha>';
	}
	return sha.substr(0, Const.shaShorten);
}
