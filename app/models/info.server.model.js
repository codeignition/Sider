'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Info Schema
 */
var InfoSchema = new Schema({
  database: {
    type: Schema.ObjectId,
    ref: 'Database',
    required : 'Please tell me about the database'
  },
  content: {
    type:Schema.Mixed
  },
  timestamp:{
  type:Date,
  default:Date.now
  }
});

mongoose.model('Info', InfoSchema);
