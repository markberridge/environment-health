"use strict";

environmentsApp.factory('configService', ['$http', function($http) {
  var service = {};
  service.get = function() {
    return $http.get('/config/');
  };
  return service;
}]);

// http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory('healthService', ['$http', '$interval', '$q', function($http, $interval, $q) {
  var service = {};
  service.check = function(url) {

    var deferred = $q.defer();
    var execute = function() {
      $http.get('/proxy/?url=' + url).then(function(response) {
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
}]);

environmentsApp.factory('pollingService', ['$rootScope', 'configService', 'healthService', function($rootScope, configService, healthService){
	var process = function(data) {

        function App(name, url, healthy, healthchecks, fellIll) {
          this.name = name;
          this.url = url;
          this.healthy = healthy;
          this.healthchecks = healthchecks;
          this.fellIll = fellIll;
          this.getTimeIll = function(){
          	return !healthy  ? new Date() - this.fellIll : 0;
          }
          this.warning = this.getTimeIll() < 30000;
        }

		var getEnvStatus = function(env) {
          	var warning = false, error = false;
          	for(var i in env.applications){
          		var app = env.applications[i];
          		
          		if(!app.warning && !app.healthy){
          		  error = true;
          		} 
          		if(app.warning){
          		  warning = true;
          		} 
          	}
            return !warning & !error ? 'success' : (error ? 'danger' : 'warning'); 
          };
          
          var getEnvFellIll = function(env) {
          	var fellIllTime  = 0; 
          	for(var i in env.applications){
          		var app = env.applications[i];
          		if(!app.healthy && app.getTimeIll && app.getTimeIll() > fellIllTime ){
          		  fellIllTime = app.getTimeIll(); 
          		}
          	}
            return fellIllTime; 
          };

        // iterate over environments JSON to get environment configuration
        for ( var i = 0; i < data.environments.length; i++) {
          var env = data.environments[i];

          // iterate over applications and call health checks
          for ( var j = 0; j < env.applications.length; j++) {
            var app = env.applications[j];

            // fix scope of data in loop using a closure
            // (http://stackoverflow.com/questions/17244614/promise-in-a-loop)
            (function(env, app, i, j) {

              healthService
                  .check(app.url)
                  .then({},{}, function(response) {

                        var healthy = (response.status == 200);

                        // calculate the time at which we first reported unhealthy
                        var fellIll = null;
                        if (!healthy) {
                          fellIll = (data.environments[i].applications[j] && data.environments[i].applications[j].fellIll) || Date.now();
                        }
                        data.environments[i].applications[j] = new App(app.name, app.url, healthy, response.data, fellIll);
                        console.log(env.name + ':' + app.name + ':' + fellIll + ". illFor:", data.environments[i].applications[j].getTimeIll());
                        data.environments[i].status = getEnvStatus(data.environments[i]);
                        data.environments[i].fellIll = getEnvFellIll(data.environments[i]);
                        $rootScope.$broadcast('app-update', {updated: Date.now(), 
                                                             data:    data, 
                                                             env:     data.environments[i], 
                                                             app:     data.environments[i].applications[j]});	
                      });
            })(env, app, i, j);
          }
        }
      };
      var updated = Date.now();
      var data = {};
      var startPolling = function(){
	      configService.get().then(function(envs) {
	        data = envs.data;
	        process(envs.data);
	      });
      }
    return {startPolling: startPolling, getData: function(){
      return data;
    }};
}]);