'use strict';

// Databases controller
angular.module('databases').controller('DatabasesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Databases',
	function($scope, $stateParams, $location, Authentication, Databases ) {
		$scope.authentication = Authentication;

		// Create new Database
		$scope.create = function() {
			// Create new Database object
			var database = new Databases ({
				name: this.name,
			    	host: this.host,
			    	port:this.portno
			});

			// Redirect after save
			database.$save(function(response) {
				$location.path('databases/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});

			// Clear form fields
			this.name = '';
		};

		// Remove existing Database
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

		// Update existing Database
		$scope.update = function() {
			var database = $scope.database ;

			database.$update(function() {
				$location.path('databases/' + database._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Databases
		$scope.find = function() {
			$scope.databases = Databases.query();
		};

		// Find existing Database
		$scope.findOne = function() {
			$scope.database = Databases.get({ 
				databaseId: $stateParams.databaseId
			});
		};
	}
]);
