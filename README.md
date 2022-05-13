# Algorizin OA Backend Solution

This file includes instructions for how to run and test all the APIs

We test the following APIs through postman-
* Registering user
* Signing-in user
* Creating an Assessment
* Submitting a response to an Assessment
* Grading an Assessment
* Viewing the Submissions to Assessments
* Viewing all the Assessments
* Viewing Grades of the Assessments

All of these API can be executed using the postman collection I have included.

Besides the API, the code also includes the following models-
* User
* Assessment
* Submissions
* Grading

Now then since there are three roles it's better to create the following using the Registering user API-
* Student1 and Student2 (For Student role)
* Instructor_Dave and Instructor_Jim (For Instructor role)
* Admin1 (For the Administrator's role)

You will notice that everything is straightforward except for the POST Grade assessment API which requires viewing the console output of our previous APIs for getting several ids

    In Grade API, the student_id field would be the uid of the students that we also assign to each submission inside the Submission model.

    While the response id will be the uid generated by each entry of the Submission model, this approach keeps multiple submissions to a single assignment unique