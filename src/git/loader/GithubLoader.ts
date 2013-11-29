///<reference path="../../_ref.d.ts" />
///<reference path="../../xm/ObjectUtil.ts" />
///<reference path="../../xm/Logger.ts" />
///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/io/HTTPCache.ts" />
///<reference path="../GithubRepo.ts" />

module git {

	var path = require('path');

	/*
	 GithubRaw: get files from raw.github.com and cache on disk
	 */
	//TODO add pruning/clear feature
	export class GithubLoader {

		repo:git.GithubRepo;
		track:xm.EventLog;

		cache:xm.http.HTTPCache;

		label:string = 'GithubLoader';
		formatVersion:string = '0.0.1';

		headers = {};

		constructor(repo:git.GithubRepo, prefix:string, label:string) {
			xm.assertVar(repo, git.GithubRepo, 'repo');
			this.repo = repo;
			this.label = label;
			this.track = new xm.EventLog(prefix, label);
		}

		_initGithubLoader(lock?:string[]):void {
			xm.ObjectUtil.lockProps(this, ['repo', 'track', 'label', 'formatVersion']);
			if (lock) {
				xm.ObjectUtil.lockProps(this, lock);
			}
			this.headers['User-Agent'] = 'gidorrah'; //this.label + '-' + this.formatVersion;
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this.cache.verbose = verbose;
		}
	}
}
