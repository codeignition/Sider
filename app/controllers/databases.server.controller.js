'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Database = mongoose.model('Database'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Database already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a Database
 */
exports.create = function(req, res) {
	var database = new Database(req.body);
	database.user = req.user;

	database.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(database);
		}
	});
};

/**
 * Show the current Database
 */
exports.read = function(req, res) {
	res.jsonp(req.database);
};

/**
 * Update a Database
 */
exports.update = function(req, res) {
	var database = req.database ;

	database = _.extend(database , req.body);

	database.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(database);
		}
	});
};

/**
 * Delete an Database
 */
exports.delete = function(req, res) {
	var database = req.database ;

	database.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(database);
		}
	});
};

/**
 * List of Databases
 */
exports.list = function(req, res) { Database.find({user: req.user.id}).sort('-created').populate('user', 'displayName').exec(function(err, databases) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(databases);
		}
	});
};

/**
 * Database middleware
 */
exports.databaseByID = function(req, res, next, id) { Database.findById(id).populate('user', 'displayName').exec(function(err, database) {
		if (err) return next(err);
		if (! database) return next(new Error('Failed to load Database ' + id));
		req.database = database ;
		next();
	});
};

/**
 * Database authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.database.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};
