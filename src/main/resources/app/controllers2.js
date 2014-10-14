var environmentsApp = angular.module('environmentsApp', [ 'ui.bootstrap' ])

environmentsApp.factory('configService', function($http) {
	var service = {};
	service.get = function() {
		return $http.get('envs/envs2.json');
	};
	return service;
});

environmentsApp.factory('environmentService', function($http, healthService) {
	var service = {};
	service.processAll = function(config) {
		for(var i = 0; i < config.environments.length; i++) {
			service.process(config.environments[i]);
		}
	};
	service.process = function(env) {
//		console.log(env.name);
		for (var i = 0; i < env.applications.length; i++) {
			healthService.check(env.applications[i]).then({}, {},
					function(data) {
						console.log('PROMISE: ' + JSON.stringify(data));
					});
		}
	};
	return service;
});

//http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory('healthService', function($http, $interval, $q) {
	var service = {};
	
	service.check = function(app) {
		
		var deferred = $q.defer();
		$interval(function() {
			$http.get('/proxy/?url=' + app.url).then(function(r) {
				deferred.notify(r.data);
			}, function(r) {
				deferred.notify(r.data);
			});
		}, 500, 5);

		return deferred.promise;
	};
	return service;
});

environmentsApp.controller('EnvironmentsCtrl', function($scope, pollingService,
		configService, environmentService) {
	
	configService.get().then(function(envs) {
		console.log('raw config: ' + JSON.stringify(envs.data));
		environmentService.processAll(envs.data);
	});

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
//	pollingService.then(function(value) {
//		// fully resolved (successCallback)
//		$scope.data = value;
//		console.log('x Success Called!');
//	}, function(reason) {
//		// error (errorCallback)
//		console.log('x Error:' + reason);
//	}, function(value) {
//		// notify (notifyCallback)
//		$scope.data = value;
//		console.log('x Notify Calls:' + value.count);
//	});

});

//http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory('pollingService', function($http, $interval, $q) {

	var data = {
		resp : {},
		status : 'Initialized',
		count : 0
	};
	var deferred = $q.defer();

	var completed = $interval(function() {
		data.status = 'Running';

		$http.get('envs/envs2.json').then(function(r) {
			data.resp = "x";
			data.count++;
//			console.log('x Http\'s:' + data.count);
//			console.log('####' + JSON.stringify(r.data));
			deferred.notify(data);
		});
	}, 500, 3);

	completed.then(function() {
		data.status = 'Completed!';
		deferred.resolve(data);
	});

	return deferred.promise;

});