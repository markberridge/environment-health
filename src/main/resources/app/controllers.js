var environmentsApp = angular.module('environmentsApp', [ 'ui.bootstrap' ])

environmentsApp.factory('configService', function($http) {
	var service = {};
	service.get = function() {
		return $http.get('envs/envs.json');
	};
	return service;
});

//http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory('healthService', function($http, $interval, $q) {
	var service = {};
	
	service.check = function(app) {
		
		var deferred = $q.defer();
		var execute = function() {
			$http.get('/proxy/?url=' + app.url).then(function(response) {
				deferred.notify(response);
			}, function(response) {
				deferred.notify(response);
			});
		};
		$interval(execute, 10000);
		execute();

		return deferred.promise;
	};
	return service;
});

environmentsApp.controller('EnvironmentsCtrl', function($scope, $modal, configService, healthService) {
	
	function App(name, url, healthy, healthchecks, fellIll) {
	    this.name = name;
	    this.url = url;
	    this.healthy = healthy;
	    this.healthchecks = healthchecks;
	    this.fellIll = fellIll;
	    this.warning = new Date() - fellIll < 30000;
	}
	
	function Env(name) {
		 this.name = name;
		 this.applications = {};
	}

	if(!$scope.data) $scope.data = {}; 
	if(!$scope.environments) $scope.environments = {}; 
	if(!$scope.envData) $scope.envData = {}; 
	
	var processAll = function(data) {
		
		// iterate over environments JSON to get environment configuration
		for (var i = 0; i < data.environments.length; i++) {
				
			var env = data.environments[i];
			var envName = env.name;
			$scope.environments[envName] = env;
			$scope.envData[envName] = new Env(envName);
			
			// iterate over each health check
			for (var j = 0; j < env.applications.length; j++) {
				
				// fix scope of data in loop using a closure
				// (http://stackoverflow.com/questions/17244614/promise-in-a-loop)
				var app = env.applications[j];
				var appName = app.name;
				var appUrl = app.url;
				(function(envName, appName, appUrl, i, j) {
					
					var process = function(response) {
						
						var healthy = (response.status == 200);
						console.log(envName + ':' + appName + ':' + healthy);
						
						//calculate the time at which we first reported unhealthy
						var fellIll = null;
						if(!healthy) {
							fellIll = ($scope.envData[envName].applications[j] && $scope.envData[envName].applications[j].fellIll) || Date.now();
						}
						
						$scope.envData[envName].applications[j] = new App(appName, appUrl, healthy, response.data, fellIll);
						$scope.updated = Date.now();
					};
					
					healthService.check(env.applications[i]).then({}, {}, process);
					
				})(envName, appName, appUrl, i, j);
			}
		}
	};
	
	configService.get().then(function(envs) {
		console.log('raw config: ' + JSON.stringify(envs.data));
		$scope.data = envs.data;
		processAll(envs.data);
	});

    $scope.open = function (env, app) {
	  var modalInstance = $modal.open({
	    templateUrl: 'healthcheck-modal.html',
	    scope: $scope,
	    controller: ModalInstanceCtrl,
	    size: 'lg',
	    resolve: {
		  env: function(){
		    return env;
		  },
	      app: function(){
	        return app;
	      }
	    }
	  });
    };

});

var ModalInstanceCtrl = function ($scope, $modalInstance, env, app) {
  $scope.env = env;
  $scope.app = app;
  $scope.time = new Date();
};