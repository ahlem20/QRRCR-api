const User = require('../models/user');
const Note = require('../models/projet');
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')



// @desc Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Get all users from MongoDB
    const users = await User.find().select('-password').lean()

    // If no users 
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }

    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})





// @desc Delete all users
const deleteAllUsers = asyncHandler(async (req, res) => {
  try {
      // Delete all notes associated with any user

      // Delete all users
      const usersDeleteResult = await User.deleteMany({});

      const reply = `${usersDeleteResult.deletedCount} users `;

      res.json({ message: reply });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});



//////////////////////////////////////////////Teacher//////////////////////////////////////////////
// @desc Create new Student
const createNewStudent = async (req, res) => {
  const { username, password, roles,teacherName, module,university, faculty, departement, spicaility, annee, groop, matricule } = req.body;

  // Confirm data
  if (!username  || !university || !faculty || !teacherName || !module || !departement || !spicaility || !annee || !groop || !matricule ) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for duplicate username
    const duplicate = await User.findOne({ matricule }).lean().exec();

    if (duplicate) {
      return res.status(409).json({ message: 'Duplicate matricule' });
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

    const userObject = {
      username,
      password: hashedPwd,
      roles,
      university,
      faculty,
      module,
      departement,
      spicaility,
      annee,
      teacherName,
      groop,
      matricule
    };

    // Create and store new user 
    const user = await User.create(userObject);

    res.status(201).json({ message: `New user ${username} created` });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};




// @desc Get all Students
const getAllstudents = asyncHandler(async (req, res) => {
    // Get all users from MongoDB
    const student = await User.find({ role: 'student' }).select('-password').lean()

    // If no users 
    if (!student?.length) {
        return res.status(400).json({ message: 'No student found' })
    }

    res.json(student)
})


// @desc Create new Teacher
const createNewteacher = asyncHandler(async (req, res) => {
  const { username, password, address,roles, email, phoneNumber } = req.body;

  // Confirm data
  if (!username || !password || !address || !email || !phoneNumber) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check for duplicate username
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: 'Duplicate teacher' });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const userObject = {
    username,
    password: hashedPwd,
    roles, // Set the role to 'teacher'
    address,
    email,
    phoneNumber,
  };

  // Create and store the new user
  const teacher = await User.create(userObject);

  if (teacher) {
    // Created
    res.status(201).json({ message: `New teacher ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid teacher data received' });
  }
});



// Get student by ID with the role "student"
const getStudentById = asyncHandler(async (req, res) => {
    const studentId = req.params.id;
  
    // Find the student by ID and role "student"
    const student = await User.findOne({ _id: studentId, role: 'student' }).select('-password').lean().exec();
  
    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  });
  
//////////////////////////////////////////////////////////Student////////////////////////////////////////////
// Controller to get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
    try {    const userId = req.params.id;
  
        // Query the User model to find all users with the role "Teacher"
        const teachers = await User.findOne({ _id: userId, role: 'teacher' }).select('-password').lean().exec();

        res.status(200).json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


// Get teacher name by ID with the role "teacher"
const getTeacherNameById = asyncHandler(async (req, res) => {
    const teacherId = req.params.id;
  
    // Find the teacher by ID and role "teacher"
    const teacher = await Teacher.findOne({ _id: teacherId, role: 'teacher' }).select('name').lean().exec();
  
    if (teacher) {
      res.status(200).json({ name: teacher.name });
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  });
  

const createNoteForStudent = asyncHandler(async (req, res) => {
  const { studentId, teacherName, projectId, points, notes } = req.body;

  try {
    // Check if required fields are provided
    if (!studentId || !teacherName || !projectId || !points || !notes) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create and store the note for the student, associated with the project/module
    const note = await Note.create({ studentId, teacherName, projectId, points, notes });

    if (note) {
      return res.status(201).json({ message: 'Note created successfully', note });
    } else {
      return res.status(500).json({ message: 'Failed to create the note' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});








// Controller to get project titles created by a teacher by username
const getProjectTitlesByTeacherUsername = asyncHandler(async (req, res) => {
    const Username = req.params.username; // Extract the teacher's username from the request params

    try {
        // Retrieve the teacher's user ID by their username
        const teacher = await User.findOne({ username: Username }).exec();

        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all projects associated with the teacher by their user ID
        const projects = await Note.find({ teacherId: teacher._id }).select('title');

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for the specified teacher' });
        }

        const projectTitles = projects.map((project) => project.title);

        res.status(200).json(projectTitles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})


  



module.exports = {
  getAllUsers,

  createNewStudent,
  getAllstudents,
  createNewteacher,   
  getTeacherNameById,
  getStudentById,
  createNoteForStudent,
  getAllTeachers,
  getProjectTitlesByTeacherUsername,
  getAllstudents,
  deleteAllUsers,
}