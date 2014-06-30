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

mongoose.model('Database', DatabaseSchema);
