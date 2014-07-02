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

DatabaseSchema.methods.fetchInfoFromClient = function(callback){
  var _this = this;
  var client = redis.createClient(_this.port, _this.host);
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
    };
  return info;
}

mongoose.model('Database', DatabaseSchema);
