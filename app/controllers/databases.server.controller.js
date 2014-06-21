'use strict';

var mongoose = require('mongoose'),
	Database = mongoose.model('Database'),
	_ = require('lodash'),
	redis=require('redis');

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
	console.log(req.database);
	res.jsonp(req.database);
};

//Getting Redis Info
exports.info = function(req,res){
	var database = req.database;
	var redis_client=redis.createClient(database.port, database.host);
	redis_client.info(function(err,reply) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			reply=reply+database;
			console.log('reply from redis info: ' + reply);
			res.jsonp(reply);
		}
	});
};

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

exports.databaseByID = function(req, res, next, id) { Database.findById(id).populate('user', 'displayName').exec(function(err, database) {
		if (err) return next(err);
		if (! database) return next(new Error('Failed to load Database ' + id));
		req.database = database ;
		next();
	});
};

exports.hasAuthorization = function(req, res, next) {
	if (req.database.user.id !== req.user.id) {
		return res.send(403, 'User is not authorized');
	}
	next();
};
