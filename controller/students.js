const studentIndex = require('../view/students/index');
const studentModel = require('../model/students');
const parseBody = require('../helpers/parseBody');

module.exports = {
  list: list,
  create: create
}

/** @function list
  * Lists the students
  */
function list(req, res) {
  var students = studentModel.getStudents();
  var html = studentIndex(students);
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
}

/** @function create
  * Creates a new student
  */
function create(req, res) {
  // 1) Parse the form content
  parseBody(req, res, function(req,res) {
    // 2) Create new student from form content
    // 3) Render the index with the new student
    list(req,res);
  });
  
}
