import assertVar = require('../../xm/assertVar');

class PackageDefinition {
	name: string;
	definitions: string[];
	manager: string;

	constructor(name: string, definitions: string[], manager?: string) {
		assertVar(name, 'string', name);
		assertVar(definitions, 'array', 'definitions');
		assertVar(manager, 'string', 'manager', true);

		this.name = name;
		this.definitions = definitions || [];
		this.manager = manager || 'unknown';
	}
}

export = PackageDefinition;
