var updateNotifier = require('update-notifier');

var notifier = updateNotifier({
	packageName: 'update-notifier-tester',
	updateCheckInterval: 1,
	packageVersion: '0.0.1'
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
