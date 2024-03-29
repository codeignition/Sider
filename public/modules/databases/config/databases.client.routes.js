'use strict';

angular.module('databases').config(['$stateProvider',
	function($stateProvider) {
		$stateProvider.
		state('listDatabases', {
			url: '/databases',
			templateUrl: 'modules/databases/views/list-databases.client.view.html'
		}).
		state('createDatabase', {
			url: '/databases/create',
			templateUrl: 'modules/databases/views/create-database.client.view.html'
		}).
		state('viewDatabase', {
			url: '/databases/:databaseId',
			templateUrl: 'modules/databases/views/view-database.client.view.html'
		}).
		state('editDatabase', {
			url: '/databases/:databaseId/edit',
			templateUrl: 'modules/databases/views/edit-database.client.view.html'
		}).
    state('keySearchInterface', {
      url: '/databases/:databaseId/keySearch',
      templateUrl: 'modules/databases/views/key-search.client.view.html'
    });
	}
]);
