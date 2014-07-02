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
  res.jsonp(req.database);
};

exports.info = function(req,res){
  req.database.getInfo(function(error, data){
    if (error) return res.send(400, {message : getErrorMessage(err)});
    else res.jsonp(data.content);
  });
};

exports.execute = function(req,res){
  if(/^flush*/.test(req.param('command'))){
    res.json({result:'You can not flush db'});
  }
  else if(/^eval*/.test(req.param('command'))){
    res.json({result: 'You can not do eval'});
  }
  else{
    var client = redis.createClient(req.database.port, req.database.host);
    var command = req.param('command').split(' ');
    client.send_command(command[0],command.splice(1), function( error, result){
      if(error){
        return res.send(400, {result: 'Invalid Command' });
      } else {
        res.json({result: result});
      }
    });
  }
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
  if (! database) return res.send(404);
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
