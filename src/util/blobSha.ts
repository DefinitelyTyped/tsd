///<reference path="../_ref.d.ts"/>
///<reference path="../git/GitUtil.ts"/>
///<reference path="../xm/io/Expose.ts"/>
///<reference path="../xm/Logger.ts"/>

module git {

	var Q = require('q');
	var path = require('path');
	var ansidiff = require('ansidiff');
	var FS = <typeof QioFS> require('q-io/fs');

	var expose = new xm.Expose('Blob Sha');
	expose.defineOption((option:xm.ExposeOption) => {
		option.name = 'path';
		option.type = 'string';
	});
	expose.defineCommand((cmd:xm.ExposeCommand) => {
		cmd.name = 'newline';
		cmd.options = ['path'];
		cmd.execute = (ctx:xm.ExposeContext) => {
			if (ctx.numArgs < 1) {
				throw new Error('specify some paths');
			}

			return Q.all(ctx.getArgsAs('string').map((target:string) => {
				var filePath = path.resolve(target);

				ctx.out.info().label('path').line(target);
				if (target !== filePath) {
					ctx.out.info().label('path').line(filePath);
				}

				return FS.read(filePath, {flags: 'rb'}).then((buffer:NodeBuffer) => {
					if (buffer.length === 0) {
						ctx.out.indent().error('empty file').line();

					}
					var raw = buffer.toString('utf8');
					var shaRaw = git.GitUtil.blobShaHex(buffer, 'utf8');
					var normalised = buffer.toString('utf8').replace(/(\r\n|\r)/g, '\n');
					var shaNormal = git.GitUtil.blobShaHex(new Buffer(normalised, 'utf8'), 'utf8');

					if (shaRaw !== shaNormal) {
						ctx.out.indent().success(shaRaw).line();
						ctx.out.indent().error(shaNormal).line();
						ctx.out.line(ansidiff.chars(xm.escapeControl(raw, true), xm.escapeControl(normalised, true)));
					}
					else {
						ctx.out.indent().success(shaRaw).line();
						ctx.out.indent().success(xm.escapeControl(raw, true)).line();
					}

				});
			})).then(() => {
				ctx.out.info().ok('done!');
			}, (err) => {
				ctx.out.info().error('error').inspect(err);
			});
		};
	});
	expose.executeArgv(process.argv);
}
