'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core');
	var databases = require('../../app/controllers/databases');
	
	app.route('/')
		.get(core.index);
	
};
