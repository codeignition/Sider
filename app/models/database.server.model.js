'use strict';

/**
 * Module dependencies.
 */
require('./info.server.model.js');
var mongoose = require('mongoose'),
Info = mongoose.model('Info'),
redis = require('redis'),
_=require('lodash'),
async = require('async'),
Schema = mongoose.Schema;

/**
 * Database Schema
 */
var DatabaseSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Database name',
    trim: true
  },
  host: {
    type: String,
    required: 'Please provide host ip to your Redis database'
  },
  port: {
    type : Number,
    default: 6379,
    required : 'Please provide port'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  interval:{
    type: Number,
    default : 1000
  }
});

function parseInfo (info) {
  for( var key in info){
    if(/^db[0-9]*$/.test(key)){
      var dbstring = info[key].split(',');
      info[key]={};
      for(var i in dbstring){
        var dbparam = dbstring[i].split('=');
        info[key][dbparam[0]]=parseInt(dbparam[1]);
      }
    }
  }
  return info;
}

DatabaseSchema.methods.connectionFactory = function( workingdb, callback){
  var client = redis.createClient(this.port, this.host);
  client.on('error', function(error){ callback(error, null) });
  client.on('connect', function(){
    client.send_command('select', [workingdb], function(error, response){
      if(error) return callback(error, null);
      callback(null, client);
    });
  });
};

function commandAllowed(command) {
  if (/^flush*/.test(command))
return new Error('You can not flush db!');
else if(/^eval*/.test(command))
return new Error('Eval is evil!');
return null;
}

DatabaseSchema.methods.execute = function(command, workingdb , callback){
  var error = commandAllowed(command);
  if(error) return callback(error, null);
  command = command.split(' ');
  this.connectionFactory( workingdb, function(error, client){
    if(error) return callback(error);
    client.send_command(command[0],command.splice(1),function(error, response){
      callback(error, response);
    });
    client.quit();
  });
}

DatabaseSchema.methods.fetchInfoFromClient = function(callback){
  var _this = this;
  _this.connectionFactory(0,function(error, client){
    _this.execute('info',0,function(){
      var info = new Info({
        database: _this,
        content:  parseInfo(client.server_info)
      });
      info.save(function(err){
        callback(err, info);
      });
    });
  });
};

DatabaseSchema.methods.getInfo = function(callback){
  var _this = this;
  Info.find({database : _this._id}).sort('-timestamp').limit(1)
  .exec(function(error, data){
    if (error || !data.length) _this.fetchInfoFromClient(function(err, latestinfo){
      if(err) callback(err);
      else callback(null, latestinfo);
    });
    else callback(null, data[0]);
  });
};

DatabaseSchema.methods.searchCollection = function(searchKeyword, selectedCollection, callback){
  this.execute('keys '+searchKeyword+'*', selectedCollection, callback);
};

DatabaseSchema.methods.getCollectionsWithKeys = function(callback){
  var collections=[];
  this.getInfo(function(error, response){
    if(error) return callback(error);
    for(var key in response.content){
      if(/^db[0-9]*$/.test(key)) collections.push(key.split('b')[1]);
    }
    callback(null, collections);
  });
}

DatabaseSchema.methods.searchAllCollections = function(searchKeyword, callback){
  var _this = this;
  var matchedKeys = [];
  this.getCollectionsWithKeys(function(error, collections){
    async.map(collections, function(collection, _callback) {
      _this.searchCollection(searchKeyword, collection, _callback);
    }, function(error, result) {
      if(error) return callback(error);
      callback(null,_.zipObject(collections,result));
    });
  });
};

mongoose.model('Database', DatabaseSchema);
