const mongoose = require('mongoose');
const uuid = require('node-uuid');
const User = require('./newUser');
const Assessment = require('../models/assessment')
const Submission = require('../models/submission')

const GradingSchema = new mongoose.Schema({
    uid: {type: String, default:uuid.v4,required: true},
    user_id: {type: String, reference: User},
    response_id: {type: String, reference: Submission},
    Grade: {type: String, required:true},
    Remark: {type: String, required: true}
},
{collection: 'grades'}
)

const grades = mongoose.model('GradingSchema',GradingSchema)

module.exports = grades

