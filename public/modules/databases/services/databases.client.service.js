'use strict';
var _command;
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
.factory('getinfo', ['$resource',
         function($resource) {
           return $resource('databases/:databaseId/info', { databaseId: '@_id'
           }, {
             info: {
               method: 'GET'
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
