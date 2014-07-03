'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var databases = require('../../app/controllers/databases');

	app.route('/databases')
		.get(users.requiresLogin, databases.list)
		.post(users.requiresLogin, databases.create);

	app.route('/databases/:databaseId/info')
		.get(users.requiresLogin, databases.hasAuthorization, databases.info);

  app.route('/databases/:databaseId/infos')
    .get(users.requiresLogin, databases.hasAuthorization, databases.infos);

  app.route('/databases/:databaseId/execute')
    .get(users.requiresLogin, databases.hasAuthorization, databases.execute);

  app.route('/databases/:databaseId/currentCollection')
    .get(users.requiresLogin, databases.hasAuthorization, databases.currentCollection);

  app.route('/databases/:databaseId')
		.get(users.requiresLogin, databases.hasAuthorization, databases.read )
		.put(users.requiresLogin, databases.hasAuthorization, databases.update)
		.delete(users.requiresLogin, databases.hasAuthorization, databases.delete);

	app.param('databaseId', databases.databaseByID);
};
