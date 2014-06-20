'use strict';

//Databases service used to communicate Databases REST endpoints
angular.module('databases').factory('Databases', ['$resource',
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
;
