const mongoose = require('mongoose');
const uuid = require('node-uuid');
const User = require('./newUser');
const Assessment = require('../models/assessment')


const SubmissionSchema = new mongoose.Schema({
    uid: {type: String, default:uuid.v4,required: true},
    user_id: {type: String, reference: User},
    title: {type: String, reference: Assessment},
    response: {type: String, required: true}

},
{timestamps: true},
{collection: 'responses'}
)

const submission = mongoose.model('SubmissionSchema',SubmissionSchema)

module.exports = submission