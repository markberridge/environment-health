var environmentsApp = angular.module('environmentsApp', ['ui.bootstrap'])

// http://embed.plnkr.co/fSIm8B/script.js
environmentsApp.factory("pollingService", function ($http, $interval, $q) {

  var data = { resp: {}, status: 'Initialized', count: 0};
  var deferred = $q.defer();
  	  
  var completed = $interval(function() {
    data.status = 'Running';
    
    $http.get('envs/envs2.json').then(function(r) {
      data.resp = "x";
      data.count++;
      console.log('Http\'s:' + data.count);
      deferred.notify(data);
    });
  }, 500, 10);
  
  completed.then(function(){
    data.status = 'Completed!';
    deferred.resolve(data); 
  });

  return deferred.promise;

});

environmentsApp.controller('EnvironmentsCtrl', function($scope, pollingService) {
    
	  pollingService.then(
	    function(value) {
	      //fully resolved (successCallback)
	      $scope.data = value;
	      console.log('Success Called!');
	    },
	    function(reason) {
	      //error (errorCallback)
	      console.log('Error:' + reason);
	    },
	    function(value) {
	      //notify (notifyCallback)
	      $scope.data = value;
	      console.log('Notify Calls:' + value.count);
	    }
	  );

	});


