const mongoose = require('mongoose');
const uuid = require('node-uuid');
const User = require('./newUser');


const AssessmentCreationSchema = new mongoose.Schema({
    uid: {type: String, default:uuid.v4,required: true},
    title: {type: String, required: true},
    Description: {type: String, required: true},
    Mentor: {type: String, required: true},
    Deadline: {type: Date, required:true}

},
{timestamps: true},
{collection: 'assessments'}
)

const assessment = mongoose.model('AssessmentCreationSchema', AssessmentCreationSchema)

module.exports = assessment