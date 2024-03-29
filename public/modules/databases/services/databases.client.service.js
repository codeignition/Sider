'use strict';
//Databases service used to communicate Databases REST endpoints
angular.module('databases')
.factory('Databases', ['$resource',
         function($resource) {
           return $resource('databases/:databaseId', { databaseId: '@_id'
           }, {
             update: {
               method: 'PUT'
             }
           });
         }
])
.factory('infoDatabase',['$resource',
         function($resource){
           return $resource('databases/:databaseId/infos',{databaseId: '@_id'
           },{
             infos:{
               method: 'GET',
               isArray: true
             }
           });
         }
])
.factory('getKeyValue',['$resource',
         function($resource){
           return $resource('databases/:databaseId/keyValue',{databaseId: '@_id'
           },{showKeyValue: {
             method : 'GET', 
             params : {selectedCollection: true, key:true }
           }
           });
         }
])
.factory('getCurrentCollection', ['$resource',
         function($resource) {
           return $resource('databases/:databaseId/currentCollection',{ databaseId: '@_id'
           }, {
             currentCollection: {
               method: 'GET'
             }
           });
         }
])
.factory('keySearch', ['$resource',
         function($resource) {
           return $resource('databases/:databaseId/keySearch',{ databaseId: '@_id'
           }, {
             searchRedis: {
               method: 'GET',
               params: {searchKeyword:true, selectedCollection:true}
             }
           });
         }
])
.factory('executeCommand',['$resource',
         function($resource){
           return $resource('databases/:databaseId/execute',{databaseId: '@_id'
           },{
             execute:{
               method: 'GET',
               parmas: {command:true}
             }
           });
         }
])
;
