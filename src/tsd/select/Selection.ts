///<reference path="../../_ref.d.ts" />
///<reference path="../../tsd/data/Def.ts" />
///<reference path="../../tsd/data/DefVersion.ts" />
///<reference path="Query.ts" />

module tsd {

	export class Selection {
		query:tsd.Query;
		definitions:tsd.Def[];
		selection:tsd.DefVersion[];

		error:any;

		constructor(query:tsd.Query = null) {
			xm.assertVar(query, tsd.Query, 'query', true);
			this.query = query;

			xm.ObjectUtil.lockProps(this, ['query']);
		}
	}
}
