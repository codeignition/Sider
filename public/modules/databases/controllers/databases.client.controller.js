'use strict';

angular.module('databases').
  controller('DatabasesController',['$scope', '$stateParams', '$location', 'Authentication','getinfo', 'getCurrentCollection', 'executeCommand', 'Databases',
             function($scope, $stateParams, $location, Authentication, getinfo, getCurrentCollection, executeCommand, Databases) {
               $scope.authentication = Authentication;
               $scope.create = function() {
                 var database = new Databases ({
                   name: this.name,
                   host: this.host,
                   port: this.portno
                 });

                 database.$save(function(response) {
                   $location.path('databases/' + response._id);
                 }, function(errorResponse) {
                   $scope.error = errorResponse.data.message;
                 });

                 this.name = '';
                 this.host = '';
                 this.port = '';
               };

               $scope.remove = function( database ) {
                 if ( database ) { database.$remove();

                   for (var i in $scope.databases ) {
                     if ($scope.databases [i] === database ) {
                       $scope.databases.splice(i, 1);
                     }
                   }
                 } else {
                   $scope.database.$remove(function() {
                     $location.path('databases');
                   });
                 }
               };

               $scope.update = function() {
                 var database = $scope.database ;

                 database.$update(function() {
                   $location.path('databases/' + database._id);
                 }, function(errorResponse) {
                   $scope.error = errorResponse.data.message;
                 });
               };

               $scope.find = function() {
                 $scope.databases = Databases.query();
               };

               $scope.findOne = function() {
                 $scope.database = Databases.get({
                   databaseId: $stateParams.databaseId
                 });

                 $scope.consoledb = getCurrentCollection.get({
                  databaseId: $stateParams.databaseId
                 });

                 $scope.redisinfo = getinfo.get({
                   databaseId: $stateParams.databaseId
                 });

                 $scope.dbarray=[];
                 $scope.dbnames=[];

                 $scope.redisinfo.$promise.then(function(data){
                   angular.forEach($scope.redisinfo, function( value, key ) {
                     if(/^db[0-9]*$/.test(key)){
                       $scope.dbnames.push(key);
                       $scope.dbarray.push($scope.redisinfo[key].keys);
                     }
                   });
                 });
               };

               $scope.userConsole = function(){
                 $scope.commandResponse = executeCommand.get({
                   databaseId: $stateParams.databaseId,
                   command: $scope.userCommand
                 }, function(){
                   $scope.consoledb.workingdb = $scope.commandResponse.workingdb;
                 },function(response){
                  if(response.status===400)
                    $scope.commandResponse={result:"Invalid Command"};
                 });
                 this.userCommand='';
               };


             }
]);
