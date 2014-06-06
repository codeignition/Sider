'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
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
    	dbpath: {
    		type: String,
    		required: 'Please provide path to your Redis database'
    	},
    	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Database', DatabaseSchema);
