//We start with importing the necessary libraries

const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const User = require('./models/newUser'); //The model for storing the users with different roles
const Assessment = require('./models/assessment') // The model for creating assessments
const mongoose = require('mongoose'); // Using Mongoose ODM for convenience
const bcryptjs = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const Submission = require('./models/submission')
const Grader = require("./models/grade")
const router = express.Router();

const JWT_SECRET = 'egkneq$lktnqegegw243ntklagvaslwf#emgavbamekgalgakevmazas@kvz'

// Connecting to MongoDB and creating a local database
mongoose.connect('mongodb://localhost:27017/login-app-record', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// To parse JSON data for our terminal to read we use bodyParser
app.use(bodyParser.json())


//First we create a post request to register users
app.post("/register", async function (req,res) {
    
    const newUser = {
        username: req.body.username,
        password: req.body.password,
        role: req.body.role
    }

    if (req.body.password.length<6) {
        return res.json({status: 'error', error: 'Password too small'})
    }

    const username = newUser["username"]
    const ipassword = req.body.password
    const role = newUser["role"]

    
    console.log(newUser)

    const password = await bcryptjs.hash(ipassword, 12)

    console.log(password)

    try {
        const rej = await User.create({
            username,
            password,
            role
        })
        console.log(rej);
    } catch(error) {
        console.log(JSON.stringify(error))

        if (error.code === 11000) {
            return res.json({status: 'error', error: 'Username already exists' })    
        }
        throw error
    }

    res.send({message: "Success."});
})


// Then we create a post request for authenticating users
app.post('/login', async function (req,res) {
    
    const returningUser = {
        username: req.body.username,
        password: req.body.password
    }

    const userid = returningUser["username"]
    const passkey = returningUser["password"]

    const user = await User.findOne({username: userid }).lean()
    console.log(userid)
    console.log(user)

    if (!user) {
        return res.json({status: 'error', error: 'Invalid username or password'})
    }

    if (await bcryptjs.compare(passkey, user.password)) {
        const token = jwt.sign({id:user.uid, username: user.username},JWT_SECRET)
        
        console.log("Login successful")
        return res.json({status: 'OK', data: token})
    }

    res.json({status: 'OK'})
})


// The below given post method can be used by instructors or admins for creating assessments
app.post('/create_assessment', async function (req,res) {
    const LoggedUser = {
        username: req.body.username,
        title: req.body.title,
        description: req.body.description,
        mentor: req.body.mentor,
        Deadline: req.body.deadline
    }

    const userid = LoggedUser["username"]
    const title = LoggedUser["title"]
    const Description = LoggedUser["description"]
    const Mentor = LoggedUser["mentor"]
    const Deadline = LoggedUser["Deadline"]

    const user = await User.findOne({username: userid }).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role === 'Student') {
        return res.json({status: 'error', error: 'the user does not have permission'})
    }

    try {
        const rej = await Assessment.create({
            title,
            Description,
            Mentor,
            Deadline
        })
        console.log(rej);
    } catch(error) {
        console.log(JSON.stringify(error))

        if (error.code === 11000) {
            return res.json({status: 'error', error: 'Duplicate assignments are not allowed' })    
        }
        throw error
    }

    res.send({message: "Success."});

})

// This post method can be used by the students for submitting responses to assignments
app.post('/submission', async function (req,res) {
    const stud = {
        username: req.body.username,
        title: req.body.title,
        response: req.body.response
    }

    const usern = stud["username"]
    const title = stud["title"]
    const response = stud["response"]

    const user = await User.findOne({username: usern }).lean()
    const user_id = user.uid

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role === 'Instructor') {
        return res.json({status: 'error', error: 'Only students can submit a response'})
    }


    try {
        const rej = await Submission.create({
            user_id,
            title,
            response
        })
        console.log(rej)

    }catch(error) {
        console.log(JSON.stringify(error))

        if (error.code === 11000) {
            return res.json({status: 'error'})    
        }
        throw error
    }

    res.send({message: "Success."});

})

//This post method is used by instructors/admins for grading student submissions
app.post('/grading', async function (req,res) {
    const ResponseToGrade = {
        username: req.body.username,
        student_id: req.body.student_id,
        response_id: req.body.response_id,
        grade: req.body.grade,
        remark: req.body.remark
    }

    const usern = ResponseToGrade["username"]
    const Grade = ResponseToGrade["grade"]
    const Remark = ResponseToGrade["remark"]
    const student_id = ResponseToGrade["student_id"]
    const response_id = ResponseToGrade["response_id"]

    const user = await User.findOne({username: usern }).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role === 'Student') {
        return res.json({status: 'error', error: 'Only Instructor can grade a response'})
    }

    const stud = await User.findOne({uid: student_id}).lean()

    if (!stud) {
        return res.json({status: 'error', error: 'This student does not exist'}) 
    }

    const studresp = await Submission.findOne({user_id: student_id, uid: response_id})

    if (!studresp) {
        return res.json({status: 'error', error: 'This response does not exist'})
    }

    try {
        const rej = await Grader.create({
            student_id,
            response_id,
            Grade,
            Remark
        })
        console.log(rej)

    }catch(error) {
        console.log(JSON.stringify(error))

        if (error.code === 11000) {
            return res.json({status: 'error'})    
        }
        throw error
    }

    res.send({message: "Success."});

})

//Now that we have finished all the POST requests, let's move on to some GET requests 


//This method can be used by all the roles for viewing the assessments
app.get('/view_assessment', async function (req,res) {
    const username = req.body.username

    const user = await User.findOne({username: username}).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }
    
    const assessment_obj = await Assessment.find({mentor: user.username}).lean()
    return res.json({status: 'success', assessments: assessment_obj})

    res.send({message: "Success."});
})


//Similarly, this get method is used for viewing the submissions for the assessments
app.get('/submission', async function (req,res) {
    const username = req.body.username

    const user = await User.findOne({username: username}).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }
    
    if (user.role === 'Student') {
        const submissions_obj = await Submission.find({user_id: user.uid}).exec()
        console.log(submissions_obj)
        return res.json({status: 'success', submissions: submissions_obj})
        
    }

    else {
        const submissions_obj = await Submission.find({}).exec()
        console.log(submissions_obj)
        return res.json({status: 'success', submissions: submissions_obj})
        
    }

    res.send({message: "Success."});
})

// Lastly, we use this GET method for viewing grades on submissions
app.get('/view_grades', async function (req,res) {
    const username = req.body.username

    const user = await User.findOne({username: username}).lean()
    const userids = user.uid
    

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role === 'Student') {
        const grade_obj = await Grader.find({user_id: user.uid}).exec()
        console.log(grade_obj)
        return res.json({status: 'success', grades: grade_obj})
    }

    else {
        const grade_obj = await Grader.find({}).exec()
        return res.json({status: 'success', grades: grade_obj})
    }

    res.send({message: "Success."});
})

// This method is used for getting a list of active users 
app.get('/view_users', async function (req,res) {
    const username = req.body.username

    const user = await User.findOne({username: username}).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can view all the users'})
    }

    const user_obj = await User.find({}).exec()
    console.log(user_obj)
    return res.json({status: 'success', users: user_obj})

})

// This method is used for removing any users specified
app.patch('/modify_users', async function (req,res) {

    const username = req.body.username
    const user_to_be_del = req.body.registereduser

    const user = await User.findOne({username: username}).lean()
    const registereduser = await User.findOne({username: user_to_be_del}).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can remove any user'})
    }

    if (!registereduser) {
        return res.json({status: 'error', error: 'This user is not registered'})
        
    }

    try {
        const removed_user = await User.findOneAndDelete({username: user_to_be_del})
        console.log(removed_user)
        return res.json({status: 'success', deleted_user: removed_user})
    }
    catch(error) {
        console.log(JSON.stringify(error))
    }
    
})

// This method is used for removing any created assessment
app.patch('/remove_assessment', async function (req,res) {
    const username = req.body.username
    const title = req.body.assessment_title

    const user = await User.findOne({username: username}).lean()

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can remove any user'})
    }

    try {
        const removed_assn = await Assessment.findOneAndDelete({title: title})
        console.log(removed_assn)
        return res.json({status: 'success', deleted_assessment: removed_assn})
    }
    catch(error) {
        console.log(JSON.stringify(error))
    }

})

// This method is used for removing any responses made towards the assessment
app.patch('/remove_submissions', async function (req,res) {
    const username = req.body.username
    const sub_id = req.body.submission_id

    const user = await User.findOne({username: username}).lean()
    const subm = await Submission.findOne({uid: sub_id})

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can remove any user'})
    }

    if (!subm) {
        return res.json({status: 'error', error: 'No submission exists by the specified submission Id'}) 
    }

    try {
        const removed_subm = await Submission.findOneAndDelete({uid: sub_id})
        console.log(removed_subm)
        return res.json({status: 'success', deleted_submission: removed_subm})
    }
    catch(error) {
        console.log(JSON.stringify(error))
    }

})

// This method is used for removing any grades assigned to a response
app.patch('/remove_grade', async function (req,res) {
    const username = req.body.username
    const resp_id = req.body.response_id

    const user = await User.findOne({username: username}).lean()
    const resp = await Grader.findOne({response_id: resp_id})

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can remove any user'})
    }

    if (!resp) {
        return res.json({status: 'error', error: 'This response is not graded yet'}) 
    }

    try {
        const removed_grade = await Grader.findOneAndDelete({response_id: resp_id})
        console.log(removed_grade)
        return res.json({status: 'success', deleted_grading: removed_grade})
    }
    catch(error) {
        console.log(JSON.stringify(error))
    }

})

// This method is used for modifying grades made towards a submission
app.patch('/modify_grades',async function (req,res) {
    const username = req.body.username
    const resp_id = req.body.response_id
    const modified_grade = req.body.modified_grade

    const user = await User.findOne({username: username}).lean()
    const resp = await Grader.findOne({response_id: resp_id})

    if (!user) {
        return res.json({status: 'error', error: 'This user does not exist'})
    }

    if (user.role !== "Administrator") {
        return res.json({status: 'error', error: 'Only Administrator can remove any user'})
    }

    if (!resp) {
        return res.json({status: 'error', error: 'This response is not graded yet'}) 
    }

    try {
        const updated_grade = await Grader.findOneAndUpdate({response_id: resp_id},{Grade: modified_grade})
        console.log(updated_grade)
        return res.json({status: 'success', modified_grade: updated_grade})
    }
    catch(error) {
        console.log(JSON.stringify(error))
    }
})


app.listen(8080, () => {
    console.log('The server is up and running')
})