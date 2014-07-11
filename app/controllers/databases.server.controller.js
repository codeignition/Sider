'use strict';


var mongoose = require('mongoose'),
Database = mongoose.model('Database'),
Info = mongoose.model('Info'),
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
      console.log(err);
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
    if (error) return res.send(400, {message : getErrorMessage(error)});
    else res.jsonp(data.content);
  });
};

exports.infos = function(req, res){
  Info.find({database : req.database._id}).sort('-timestamp').limit(10)
  .exec(function(error, data){
    if(error) return res.send(400, {message : getErrorMessage(error)});
    else res.jsonp(data);
  });
};


exports.currentCollection = function(req,res){
  res.json({workingdb:req.session.workingdb});
};

exports.setWorkingdb = function(req, res, next){
  if(/^select*/.test(req.param('command')))
    req.session.workingdb=req.param('command').split(' ')[1];
  else if(!req.session.workingdb)
    req.session.workingdb=0;
  next();
};

exports.execute = function(req,res){
  var command = req.param('command');
  req.database.execute(command, req.session.workingdb, function(error, response){
    if(error)
      res.send(400, {message : error.message});
    else
      res.json({result:response, workingdb: req.session.workingdb});
  });
};

exports.searchRedis = function(req,res,cb){
  var database = req.database;
  var searchKeyword = req.param('searchKeyword');
  var selectedCollection = req.param('selectedCollection');
  var matchedKeys=[];
  if(selectedCollection==='All Collections'){
    var client = redis.createClient(database.port, database.host);
    client.info(function(){
      var info= client.server_info;
      var dbs=[];
      for(var key in info){
        if(/^db[0-9]*$/.test(key)){
          key = key.split('b');
          dbs.push(key[key.length-1]);
        }
      }
      var jcount=0;
      for(var i=0; i<dbs.length; i++){
        client.select(dbs[i]);
        client.send_command('keys',['*'],function(error,result){
          if(error)
            console.log(error);
          else{
            var keys = result;
            for( var j=0; j<keys.length ; j++){
              if((new RegExp('^'+searchKeyword)).test(keys[j])){
                matchedKeys.push(keys[j]+'-db'+jcount);
              }
            }
          }
          jcount++;
          if (jcount===dbs.length) {
            res.json({result:matchedKeys});
          }
        });

      }
    });
  }
  else{
    selectedCollection = selectedCollection.split('b');
    var client = redis.createClient(database.port, database.host);
    client.select(selectedCollection[selectedCollection.length-1]);
    client.send_command('keys',['*'],function(error,result){
      if(error)
        console.log(error);
      else{
        var keys = result;
        var matchedKeys = [];
        for( var i=0; i<keys.length ; i++){
          if((new RegExp('^'+searchKeyword)).test(keys[i])){
            matchedKeys.push(keys[i]);
          }
        }
        res.json({result:matchedKeys});
      }
    });
  }
};

exports.showKeyValue = function(req,res){
  var database = req.database;
  var selectedCollection = req.param('selectedCollection');
  var key = req.param('key');
  var client = redis.createClient(database.port, database.host);

  client.select(selectedCollection);
  client.send_command('get',[key],function (error,response) {
    if(error)
      console.log(error);
    else
      {res.json({value:response});
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
