'use strict';

var mongoose = require('mongoose');
var redis = require('redis');
var Database = mongoose.model('Database');
var Info = mongoose.model('Info');
var jobs = require('../../app/jobs/info.server.jobs.js');
var should = require('should');
var count;
describe('Jobs test', function(){
  beforeEach(function(done){
    var database1 = new Database({
      name:'name',
      port: 6379,
      host: 'localhost'
    });
    var database2 = new Database({
      name:'name',
      port: 6379,
      host: 'localhost'
    });
    database1.save(function(){
      database2.save(function(){
        done();
      });
    });
  });

  it('should be able to return redis-info', function(done){
    jobs.job();
    jobs.infoEmitter.on('jobdone', function(){
      Info.count({}, function(err, count){
        count.should.equal(2);
        done();
      });
    });
  });

  afterEach(function(done){
    Database.remove().exec();
    Info.remove().exec();
    done();
  });
});
