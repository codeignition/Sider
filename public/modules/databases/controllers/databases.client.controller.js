'use strict';

angular.module('databases').controller('DatabasesController', ['$scope', '$stateParams', '$location', 'Authentication','getinfo', 'Databases',
                                       function($scope, $stateParams, $location, Authentication, getinfo, Databases) {
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

                                           $scope.redisinfo = getinfo.get({
                                             databaseId: $stateParams.databaseId
                                           });
                                           console.log($scope.redisinfo);
                                           $scope.dbarray=[];
                                           $scope.dbnames=[];
                                           $scope.redisinfo.$promise.then(function(data){
                                             angular.forEach($scope.redisinfo, function( value, key ) {
                                               //Please do not remove the comments

                                               //if(value.keys !== undefined && value.keys!==NaN && key!==NaN ){
                                               // $scope.dbnames.push(key);
                                               //$scope.dbarray.push(parseInt(value.keys));}

                                               if(/^db[0-9]*$/.test(key)){
                                                 $scope.dbnames.push(key);
                                                 var keyportion=value.split(',');
                                                 var keyvalue=keyportion[0].split('=');
                                                 $scope.dbarray.push(parseInt(keyvalue[1]));
                                               }
                                             });
                                           });
                                         };
                                       }
]);
