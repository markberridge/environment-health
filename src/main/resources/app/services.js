"use strict";

environmentsApp.factory('configService', ['restService', function(restService) {
  var service = {};
  service.get = function() {
    return restService.get('/config/');
  };
  return service;
}]);

environmentsApp.factory('restService', ['$http', function($http) {
  var service = {};
  service.get = function(url) {
    return $http.get(url);
  };
  return service;
}]);


// http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory('healthService', ['restService', '$interval', '$q', function(restService, $interval, $q) {
  var service = {};
  service.check = function(url) {

    var deferred = $q.defer();
    var execute = function() {
      restService.get('/proxy/?url=' + url).then(function(response) {
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
          	return !this.healthy  ? new Date() - this.fellIll : 0;
          }
          this.warning = !this.healthy && (this.getTimeIll() < 30000);
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


if(window.location.href.indexOf("?mode=stubbed") > -1){
	//Stub the api calls to provide demo functionality
	environmentsApp.factory('restService', ['$q', function($q) {
	  var service = {};
	  service.get = function(url) {
	    if(url.indexOf("/config") > -1){
		    var response = 
		    { data: { "environments": [
		              {"name": "TX01", "applications": [{"name": "One","url": "http://localhost:8880/health1"}, {"name": "Two","url": "http://localhost:8880/health2"}]},
		              {"name": "TX02", "applications": [{"name": "Three","url": "http://localhost:8880/health3"}, {"name": "Four","url": "http://localhost:8880/health4"}, {"name": "Five","url": "http://localhost:8880/health5"}]},
		              {"name": "TX03", "applications": [{"name": "Six","url": "http://localhost:8880/unhealthy"}]}
		              ],
		              "links": [{"name": "Wiki", "url": "http://www.mediawiki.org/"},{"name": "Jenkins","url": "http://jenkins-ci.org/"}]},
		      status: 200
		    }
	    }
	    if(url.indexOf("/health") > -1){
		    var number = Math.floor((Math.random() * 100) + 1);
		    var success = number < 81;
		    var response = 
		    { data: {"randomHealthCheck5":{"healthy":success,"message": (number + "/80")}},
		      status: success ? 200 : 500
		    }
	    }
	    if(url.indexOf("/unhealthy") > -1){
		    var response = 
		    { data: {"healthyHealthCheck":{"healthy":true,"message": ("12/80")}, "unHealthyHealthCheck":{ "healthy": false,
        "message": "Error!",
        "error": {
            "message": "Error!",
            "stack": [
                "uk.co.markberridge.environment.health.dummyChecks.AlwaysUnhealthyHealthCheck.check(AlwaysUnhealthyHealthCheck.java:16)",
                "com.codahale.metrics.health.HealthCheck.execute(HealthCheck.java:172)", "..."
                ]}}},
		      status: 500
		    }
	    }
	    var deferred = $q.defer();
		deferred.resolve(response);
	    return deferred.promise;
	  };
	    
	  return service;
	}]);
}
