require('es6-shim');

var updateNotifier = require('update-notifier');
var notifier = updateNotifier({
	packageName: 'update-notifier-tester',
	packageVersion: '0.0.2'
});

if (notifier.update) {
	console.log('update!');
	console.log(notifier.update);
	console.log(notifier);
}
else {
	console.log('no update :(');
	console.log(notifier);
}
