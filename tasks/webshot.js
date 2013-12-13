module.exports = function (grunt) {
	'use strict';

	grunt.registerMultiTask('webshot', 'Easy website screenshots', function() {
		var options = this.options({
			site: null,
			savePath: null
		});
		var done = this.async();

		if (!options.site) {
			grunt.fail.warn('undefined site');
			done(false);
		}
		if (!options.savePath) {
			grunt.fail.warn('undefined savePath');
			done(false);
		}

		// lets clean from options
		var site = options.site;
		var savePath = options.savePath;

		delete options.site;
		delete options.savePath;

		if (options.siteType === 'file') {
			site = grunt.file.read(site);
			options.siteType = 'html';
		}

		// late init
		var webshot = require('webshot');

		webshot(site, savePath, options, function(err) {
			if (err) {
				grunt.fail.warn('undefined target');
				grunt.fail.warn(err);
				done(false);
			}

			done(true);
		});
	});
};
