"use strict";

if(typeof console === "undefined") {
  console = {log: function() {}};
}

var environmentsApp = angular.module('environmentsApp', [ 'ui.bootstrap', 'ngRoute' ]);

environmentsApp.config(['$routeProvider', 
  function($routeProvider) {
    $routeProvider.
      when('/compact', {
        templateUrl: 'views/compactView.html' ,
        controller: 'EnvironmentsCtrl'
      }).
      when('/exploded', {
        templateUrl: 'views/explodedView.html' ,
        controller: 'EnvironmentsCtrl'
      }).
      otherwise({
        redirectTo: '/compact'
      });
  }]);

environmentsApp.run(['pollingService', function (pollingService){
  pollingService.startPolling();
}]);

environmentsApp.controller('NavCtrl', ['$scope', '$modal', '$location', 'configService', function($scope, $modal, $location, configService) {
    $scope.expandedView = $location.path().indexOf('exploded') >= 0;
    $scope.toggleView = function() {
      $scope.expandedView = $location.path().indexOf('exploded') < 0;
      $location.path($scope.expandedView ? '/exploded' : '/compact');
    };
    configService.get().then(function(result) {
      $scope.links = result.data.links;
    });
}]);

environmentsApp.controller('EnvironmentsCtrl', ['$rootScope', '$scope', '$modal', 'healthService', 'pollingService', 
function($rootScope, $scope, $modal, healthService, pollingService) {
  $scope.data = pollingService.getData();
  $scope.updated = pollingService.updated;
  
  $scope.open = function(env, app) {
    var modalInstance = $modal.open({
      templateUrl : 'views/appModal.html',
      scope : $scope,
      controller : 'AppModalCtrl',
      size : 'lg',
      resolve : {
        env : function() {
          return env;
        },
        app : function() {
          return app;
        }
      }
    });
  };
  
  $scope.$on('app-update', function(event, args){
    $scope.updated = args.updated;
    $scope.data = args.data;
  });
}]);

environmentsApp.controller('AppModalCtrl', ['$scope', '$modalInstance', 'env', 'app', function ($scope, $modalInstance, env, app) {
  $scope.env = env;
  $scope.app = app;
  $scope.time = new Date();
  //$scope.$on('app-update', function(event, args){
  //  var updateIsForThisApplication = args.env.name == env.name && args.app.name == app.name;
  //  if(updateIsForThisApplication){
  //    $scope.app = args.app;
  //    $scope.env = args.env;
  //    $scope.time = args.updated;
  //  }
  //});
}]);

