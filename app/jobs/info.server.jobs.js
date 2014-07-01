'use strict';
var redis = require('redis');
var mongoose = require('mongoose');
var database = mongoose.model('Database');
var Info = mongoose.model('Info');
var dbs, client, info, serverinfo;
var events = require('events');
var async = require('async');
var client, redisinfo, serverinfo, dbs, db;

exports.schedule = "* * * * * *";

var EventEmitter = events.EventEmitter;
exports.infoEmitter = new EventEmitter();

exports.job = function(){
  database.find()
  .exec(function(err, dbs){
    async.each(dbs, function(db, callback){
      client = redis.createClient(db.port, db.host);
      client.info(function(err, redisinfo){
        var info = new Info({
          database : db,
          content : client.server_info
        });
        client.quit();
        info.save(function(err){
          callback();
        });
      });
    },function(err){
      if (err) console.log(err);
      exports.infoEmitter.emit('jobdone');
    });
  });
}
