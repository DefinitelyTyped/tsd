///<reference path="../_ref.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../iterate.ts" />

module xm {

	class ExposeCommand {
		constructor(public id:string, public execute:(args:any) => void, public label?:string, public hint?:any) {

		}

		getLabels():string {
			var ret = this.id;
			if (this.label) {
				ret += ' (' + this.label + ')'
			}
			if (this.hint) {
				var arr = [];
				xm.eachProp(this.hint, (label, id) => {
					arr.push('     --' + id + ' ' + label + '');
				});
				if (arr.length > 0) {
					ret += '\n' + arr.join('\n');
				}
			}
			return ret;
		}
	}

	export class Expose {

		private _commands = new KeyValueMap();

		constructor() {
			this.add('help', () => {
				console.log('available commands:');
				xm.eachProp(this._commands.keys().sort(), (id) => {
					console.log('   ' + this._commands.get(id).getLabels());
				});
			}, 'usage help');
			//this.map('h', 'help');
		}

		executeArgv(argv:any, alt?:string) {
			if (!argv || argv._.length === 0) {
				if (alt && this._commands.has(alt)) {
					this.execute(alt);
				}
				this.execute('help');
			}
			else {
				if (this.has(argv._[0])) {
					this.execute(argv._[0], argv);
				}
				else {
					console.log('command not found: ' + argv._[0]);
					this.execute('help');
				}
			}
		}

		execute(id:string, args:any = null, head:bool = true) {
			if (!this._commands.has(id)) {
				console.log('\nunknown command ' + id + '\n');
				return;
			}
			if (head) {
				console.log('\n-> ' + id + '\n');
			}
			var f:ExposeCommand = this._commands.get(id);
			f.execute.call(null, args);
		}

		add(id:string, def:(args:any) => void, label?:string, hint?:any) {
			if (this._commands.has(id)) {
				throw new Error('id collision on ' + id);
			}
			this._commands.set(id, new ExposeCommand(id, def, label, hint));
		}

		has(id:string):bool {
			return this._commands.has(id);
		}

		map(id:string, to:string) {
			var self = this;
			this.add(id, () => {
				self.execute(to, false);
			});
		}
	}
}