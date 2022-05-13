const { UUID } = require('bson');
const mongoose = require('mongoose');
const uuid = require('node-uuid');

const RegisteredUserSchema = new mongoose.Schema({
    uid: {type: String, default:uuid.v4,required: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true}
},
{collection: 'users'}
)

const newUser = mongoose.model('RegisteredUserSchema', RegisteredUserSchema)

module.exports=newUser