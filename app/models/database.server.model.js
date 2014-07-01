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

DatabaseSchema.methods.getLatestInfo = function(callback){
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

function parseInfo (info) {
    for( var key in info){
      var dbstring = info[key];
      if(/^db[0-9]*$/.test(key)){
        info[key] = dbstring.split(',');
        var keysInfo = info[key][0].split('=');
        var expiresInfo = info[key][1].split('=');
        var avg_ttlInfo = info[key][2].split('=');
        info[key]={};
        info[key].keys = parseInt(keysInfo[1]);
        info[key].expires = parseInt(expiresInfo[1]);
        info[key].avg_ttl = parseInt(avg_ttlInfo[1]);
      }
    };
  return info;
}

mongoose.model('Database', DatabaseSchema);
