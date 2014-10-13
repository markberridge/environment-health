var environmentsApp = angular.module('environmentsApp', [ 'ui.bootstrap' ])

environmentsApp.factory('configService', function($http) {
	var service = {};
	service.get = function() {
		return $http.get('envs/envs2.json');
	};
	return service;
});

environmentsApp.factory('environmentService', function($http, healthCheckService) {
	var service = {};
	service.processAll = function(config) {
		for(var i = 0; i < config.environments.length; i++) {
			service.process(config.environments[i]);
		}
	};
	service.process = function(env) {
		console.log(env.name);
		for(var i = 0; i < env.applications.length; i++) {
			healthCheckService.check(env.applications[i]);
		}
	};
	
	return service;
});

environmentsApp.factory('healthCheckService', function($http, $interval, $q) {
	var service = {};
	service.check = function(app) {
		console.log(' - ' + app.name + ' @ ' + app.url);
	};
	return service;

});

environmentsApp.controller('EnvironmentsCtrl', function($scope, pollingService,
		configService, environmentService) {
	
	configService.get().then(function(envs) {
		console.log('raw config: ' + JSON.stringify(envs.data));
		environmentService.processAll(envs.data);
	});

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	pollingService.then(function(value) {
		// fully resolved (successCallback)
		$scope.data = value;
		console.log('Success Called!');
	}, function(reason) {
		// error (errorCallback)
		console.log('Error:' + reason);
	}, function(value) {
		// notify (notifyCallback)
		$scope.data = value;
		console.log('Notify Calls:' + value.count);
	});

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
			console.log('Http\'s:' + data.count);
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