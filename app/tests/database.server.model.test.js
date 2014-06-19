'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Database = mongoose.model('Database'),
	redis = require('redis'),
	dbController=require('../../app/controllers/databases');
/**
 * Globals
 */
var user,sampleuser, database,db,redis_client;

/**
 * Unit tests
 */
describe('Database Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			database = new Database({
				name: 'Database Name',
				 host:'host',
				 port:'port',
				user: user
			});
		});
		//creating another sample user
		sampleuser = new User({
			firstName: 'sampleFull',
			lastName: 'sampleName',
			displayName: 'sampleFull sampleName',
			email: 'sampletest@test.com',
			username: 'sampleusername',
			password: 'samplepassword'
		});
		
		sampleuser.save(function() { 
			db=new Database({
				name: 'another db',
				host: 'host',
				port: 'port',
				user: sampleuser
			});
			db.save();
			done();
		});

	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return database.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			database.name = '';

			return database.save(function(err) {
				should.exist(err);
				done();
			});
		});
		it('should be able to show an error when try to save without host', function(done) { 
			database.host = '';

			return database.save(function(err) {
				should.exist(err);
				done();
			});
		});
		it('should be able to show an error when try to save without port', function(done) { 
			database.port = '';

			return database.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});
	describe('Method Read', function() {
		it('should give error when tries to read other users databases', function(done) {
			return db.read(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	describe('Redis Info', function() {
		it('should give redis info of a server without any error', function(done) {
			redis_client=redis.createClient(6379,'127.0.0.1');
			return redis_client.info(function(err) {
				should.not.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Database.remove().exec();
		User.remove().exec();

		done();
	});
});
