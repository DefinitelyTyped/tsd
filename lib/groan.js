// return a parameter accessor
var getParamAccess = function (id, params) {
	// easy access
	var paramGet = function (prop, alt, required) {
		if (arguments.length < 1) {
			throw (new Error('expected at least 1 argument'));
		}
		if (arguments.length < 2) {
			required = true;
		}
		if (params && params.hasOwnProperty(prop)) {
			return params[prop];
		}
		if (required) {
			if (!params) {
				throw (new Error('no params supplied for: ' + id));
			}
			throw (new Error('missing groan param property: ' + prop + ' in: ' + id));
		}
		return alt;
	};
	paramGet.raw = params;
	return paramGet;
};

var pushHash = function (hash, name, value) {
	if (!hash.hasOwnProperty(name)) {
		hash[name] = [value];
	}
	else {
		hash[name].push(value);
	}
};
var pushUnique = function (arr, value) {
	if (arr.indexOf(value) < 0) {
		arr.push(value);
	}
};

var csvSplit = /[ \t]*[,;][ \t]*/g;
var splitify = function () {
	var ret = [];
	for (var i = 0; i < arguments.length; i++) {
		splitifyValueTo(arguments[i], ret);
	}
	return ret;
};
var splitifyValueTo = function (value, ret) {
	ret = ret || [];
	var i;
	if (typeof value === 'string') {
		value = value.split(csvSplit);
		for (i = 0; i < value.length; i++) {
			ret.push(value[i]);
		}
	}
	else {
		for (i = 0; i < value.length; i++) {
			splitifyValueTo(value[i], ret);
		}
	}
	return ret;
};

module.exports = {
	link: function (grunt) {
		"use strict";

		var api = {};
		grunt.groan = api;

		var map = {};
		var initialisers = {};

		var selections = {};
		var config = {};

		var isInit = false;

		api.config = function (cfg) {
			grunt.util._.forEach(cfg, function (value, prop) {
				config[prop] = value;
			});
		};
		api.loadNpm = function (name) {
			grunt.util._.forEach(arguments, function (name) {
				grunt.loadNpmTasks(name);
			});
		};
		api.loadTasks = function (name) {
			grunt.util._.forEach(arguments, function (name) {
				grunt.loadTasks(name);
			});
		};
		api.alias = function (name, tasks) {
			var arr = [];
			for (var i = 1; i < arguments.length; i++) {
				splitifyValueTo(arguments[i], arr);
			}
			grunt.registerTask(name, arr);
		};

		api.define = function (type, func) {
			if (arguments.length < 2) {
				throw (new Error('expected at least 2 arguments'));
			}
			if (initialisers.hasOwnProperty(type)) {
				throw(new Error('cannot override conf type:' + type));
			}
			initialisers[type] = func;
		};

		api.create = function (type, id, params, groups) {
			if (arguments.length < 4) {
				throw (new Error('expected at least 4 arguments'));
			}
			if (!initialisers.hasOwnProperty(type)) {
				throw(new Error('missing conf type:' + type));
			}
			groups = splitify(groups);

			grunt.util._.forEach(splitify(id), function (id) {
				map[id] = {
					id: id,
					type: type,
					params: params,
					plugins: [],
					groups: groups
				};
			});
		};
		api.select = function (id, selector) {
			selections[id] = selector;
		};

		api.init = function (cfg) {
			if (isInit) {
				throw (new Error('multiple call to init() detected'));
			}
			isInit = true;
			if (cfg) {
				api.config(cfg);
			}

			var groups = {};
			var types = {};
			var plugins = {};
			var all = [];

			// import config
			grunt.util._.forEach(config, function (plugin, pluginName) {
				if (pluginName === 'pkg') {
					return;
				}
				grunt.util._.forEach(plugin, function (target, targetName) {
					if (targetName === 'options') {
						return;
					}
					var data = {
						id: targetName,
						type: pluginName,
						plugins: [pluginName]
					};
					pushHash(plugins, pluginName, data);
					all.push(data);
				});
			});

			// add custom
			grunt.util._.forEach(map, function (data) {
				var tasks = [];

				all.push(data);

				var alias = 'groan:' + data.id;

				// add closures for easy access
				var addConf = function (pluginName, target, conf) {
					if (arguments.length < 2) {
						throw (new Error('expected at least 2 arguments'));
					}
					if (arguments.length === 2) {
						conf = target;
						target = data.id;
					}
					if (!config.hasOwnProperty(pluginName)) {
						config[pluginName] = {};
					}
					config[pluginName][target] = conf;

					pushUnique(data.plugins, pluginName);
					pushHash(plugins, pluginName, data);

					tasks.push(pluginName + ':' + target);
				};
				var addTask = function (plugin, target) {
					if (arguments.length < 1) {
						throw (new Error('expected at least 2 arguments'));
					}
					if (arguments.length === 2) {
						tasks.push(plugin + ':' + target);
					} else {
						tasks.push(plugin);
					}
				};
				var addGroup = function (group) {
					if (arguments.length < 1) {
						throw (new Error('expected at least 2 arguments'));
					}
					grunt.util._.each(splitify(group), function (groupName) {
						pushHash(groups, groupName, alias);
					});
				};

				// context
				var grr = {
					grunt: grunt,
					config: config,
					addConf: addConf,
					addGroup: addGroup,
					addTask: addTask,
					getParam: getParamAccess(data.id, data.params)
				};

				// execute
				initialisers[data.type].apply(null, [grr, data.id]);

				grunt.registerTask(alias, tasks);

				// keep type
				pushHash(types, data.type, alias);

				// add to groups
				if (data.groups) {
					grunt.util._.forEach(data.groups, function (groupName) {
						pushHash(groups, groupName, alias);
					});
				}
			});

			// add combi aliases
			grunt.util._.forEach(groups, function (tasks, id) {
				grunt.registerTask('groan-group:' + id, tasks);
			});
			grunt.util._.forEach(types, function (tasks, id) {
				grunt.registerTask('groan-type:' + id, tasks);
			});

			// selector
			grunt.util._.forEach(selections, function (selector, id) {

				var tasks = all.slice(0);

				// subroutine
				var check = function (tasks, field, call) {
					if (field && tasks.length > 0) {
						grunt.util._.forEach(splitify(field), function (field) {
							if (tasks.length > 0) {
								tasks = grunt.util._.filter(tasks, function (task) {
									return call(task, field);
								});
							}
						});
					}
					return tasks;
				};

				tasks = check(tasks, selector.type, function (task, field) {
					return task.type === field;
				});
				tasks = check(tasks, selector.plugins, function (task, field) {
					return task.plugins.indexOf(field) > -1;
				});
				tasks = check(tasks, selector.groups, function (task, field) {
					return task.groups.indexOf(field) > -1;
				});

				// convert to task names
				tasks = grunt.util._.map(tasks, function (task) {
					return task.type + ':' + task.id;
				});

				grunt.registerTask('groan-select:' + id, tasks);
			});

			grunt.initConfig(config);
		};
		return api;
	}
};