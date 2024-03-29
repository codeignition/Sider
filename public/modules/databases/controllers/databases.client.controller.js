'use strict';

angular.module('databases').
  controller('DatabasesController',['$scope', '$stateParams', '$location', 'Authentication', 'infoDatabase' , 'getCurrentCollection', 'executeCommand','keySearch', 'Databases','getKeyValue',
             function($scope, $stateParams, $location, Authentication, infoDatabase,  getCurrentCollection, executeCommand, keySearch, Databases, getKeyValue) {
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

                 $scope.infodb = infoDatabase.query({
                   databaseId: $stateParams.databaseId
                 });


                 var infodbarr =[];
                 var timearr = [];
                 $scope.dbnames=[];
                 $scope.dbarray=[];


                 $scope.infodbArr2=[0,1,2,3,4,5,6,7,8,9];

                 $scope.infodb.$promise.then(function(callback){
                   $scope.redisinfo=$scope.infodb[0].content;
                   angular.forEach($scope.redisinfo, function( value, key ) {
                     if(/^db[0-9]*$/.test(key)){
                       $scope.collections.push(key);
                       $scope.dbnames.push(key);
                       $scope.dbarray.push($scope.redisinfo[key].keys);
                     }
                   });
                   for(var i in $scope.infodbArr2){
                     var j = $scope.infodbArr2.length - 1 - i;
                     infodbarr[j] = parseInt($scope.infodb[i].content.used_memory)/1024;
                     timearr[j]=(($scope.infodb[i].timestamp.split('T'))[1].split('.'))[0];
                   }
                   $scope.timeArr=timearr;
                   $scope.infodbArr1 = infodbarr;
                 });

                 $scope.collections=['All Collections'];


                 $scope.selectedCollection = 'All Collections';

               };

               $scope.showKeyValue = function(key){
                 if($scope.selectedCollection==='All Collections'){
                   $scope.keyValue = getKeyValue.get({
                     databaseId: $stateParams.databaseId,
                     selectedCollection: key[1].split('b')[1],
                     key: key[0]
                   });
                   $scope.isClicked=true;
                   $scope.forKey=key;
                 }
                 else{
                   $scope.keyValue = getKeyValue.get({
                     databaseId: $stateParams.databaseId,
                     selectedCollection: $scope.selectedCollection.split('b')[1],
                     key: key
                   });
                   $scope.isClicked=true;
                   $scope.forKey=key;
                 }
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

               $scope.searchRedis=function(){
                 if($scope.searchKeyword)$scope.searchResult = keySearch.get({
                   databaseId: $stateParams.databaseId,
                   searchKeyword: $scope.searchKeyword,
                   selectedCollection: $scope.selectedCollection
                 });
               };


             }
]);
