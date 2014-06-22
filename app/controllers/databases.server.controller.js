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

exports.read = function(req, res) {
	console.log(req.database);
	res.jsonp(req.database);
};

exports.info = function(req,res){
	var client = redis.createClient(req.database.port, req.database.host);
  client.info(function( err, info) {
		if (err) {
			return res.send(400, { message: getErrorMessage(err) });
		} else {
      var  myattr =  _.pick(client.server_info, function(value, key){ return /^db[0-9]*$/.test(key); });
      var myattr1 = _.pluck(myattr);
      var i;
      //var  myattr3 = client.get_dbsize_info;
      //var str ='';
      //str += myattr1;
      //var myattr2 = str.split('=');
      for(i in myattr1){
        var str = '';
        myattr1[i]+=str;
        str=myattr1[i].split(',');
        var keystr=str[0].split('=');
        var keys=parseInt(keystr[1]);
        console.log(keys);
      }
    	res.jsonp(myattr);
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
