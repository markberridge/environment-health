var environmentsApp = angular.module('environmentsApp', ['ui.bootstrap'])

environmentsApp.factory('pollingService', ['$http', function($http){
    var defaultPollingTime = 10000;
    var polls = {};

    return {
        startPolling: function(name, url, pollingTime, callback) {
            // Check to make sure poller doesn't already exist
            if (!polls[name]) {
                var poller = function() {
                    $http.get(url).success(callback).error(callback);
                }
                poller();
                polls[name] = setInterval(poller, pollingTime || defaultPollingTime);
            }
        },

        stopPolling: function(name) {
            clearInterval(polls[name]);
            delete polls[name];
        }
    }
}]);

environmentsApp.controller('EnvironmentsCtrl', [ "$scope", "$http", "$modal", "pollingService", function($scope, $http, $modal, pollingService) {
	
	function App(name, url, healthy, healthchecks, fellIll) {
	    this.name = name;
	    this.url = url;
	    this.healthy = healthy;
	    this.healthchecks = healthchecks;
	    this.fellIll = fellIll;
	}
	
	function Env(name) {
		 this.name = name;
		 this.applications = {};
	}
	
	if(!$scope.environments) $scope.environments = {}; 
	if(!$scope.envData) $scope.envData = {}; 
	
	// get the list of environments
	$http.get('envs/envs.json').success(function(data) {

		// iterate over environments JSON to get environment configuration
		for (var i = 0; i < data.environments.length; i++) {
			$http.get('envs/' + data.environments[i] + '.json').success(function(data) {
				
				var envName = data.name;
				$scope.environments[envName] = data;
				$scope.envData[envName] = new Env(envName);
				
				// iterate over each health check
				for (var i = 0; i < data.applications.length; i++) {
					
					// fix scope of data in loop using a closure
					// (http://stackoverflow.com/questions/17244614/promise-in-a-loop)
					var appName = data.applications[i].name;
					var appUrl = data.applications[i].url;
					(function(envName, appName, appUrl, i) {
						var process = function(data, status) {
							var healthy = (status == 200);
							console.log(envName + ":" + appName + ":" + healthy);
							
							//calculate the time at which we first reported unhealthy
							var fellIll = null;
							if(!healthy) {
								fellIll = ($scope.envData[envName].applications[i] && $scope.envData[envName].applications[i].fellIll) || Date.now();
							}
							
							$scope.envData[envName].applications[i] = new App(appName, appUrl, healthy, data, fellIll);
							$scope.updated = Date.now();
						};
						pollingService.startPolling(envName + ":" + appName, "/proxy/?url=" + appUrl, null, process);
						
					})(envName, appName, appUrl, i);
				}
			});
		}
	});

    $scope.open = function (env, app) {
	  var modalInstance = $modal.open({
	    templateUrl: 'myModalContent.html',
	    scope: $scope,
	    controller: ModalInstanceCtrl,
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
	  
} ]);


var ModalInstanceCtrl = function ($scope, $modalInstance, env, app) {
  $scope.env = env;
  $scope.app = app;
  $scope.ok = function () {
    $modalInstance.close();
  };
  console.log($scope);
};