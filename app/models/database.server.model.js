'use strict';

/**
 * Module dependencies.
 */
require('./info.server.model.js');
var mongoose = require('mongoose'),
Info = mongoose.model('Info'),
redis = require('redis'),
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

DatabaseSchema.methods.connectionFactory = function(callback){
  var client = redis.createClient(this.port, this.host);
  client.on('error', function(error){ callback(error) });
  client.on('connect', function(){ callback(null, client); });
};

function commandAllowed(command) {
  if(/^flush*/.test(command))
    return new Error('You can not flush db!');
  else if(/^eval*/.test(command))
    return new Error('Eval is evil!');
  return null;
}

DatabaseSchema.methods.execute = function(command, callback){
  var error = commandAllowed(command)
  if(error) return callback(error, null);
  command = command.split(' ');
  this.connectionFactory(function(error, client){
    if(error) return callback(error);
    client.send_command(command[0],command.splice(1),function(error, response){
      callback(error, response);
    });
    client.quit();
  });
}

DatabaseSchema.methods.fetchInfoFromClient = function(callback){
  var _this = this;
  var client = redis.createClient(_this.port, _this.host);
  client.on('error', function(error){console.log(error); client.quit(); });
  client.on('connect', function(){
    client.info(function(){
      var info = new Info({
        database: _this,
        content:  parseInfo(client.server_info)
      });
      info.save(function(err){
        callback(err, info);
      });
      client.quit();
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


mongoose.model('Database', DatabaseSchema);
