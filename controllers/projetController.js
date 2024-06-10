const Project = require('../models/projet'); // Assuming you have a "projet" model
const asyncHandler = require('express-async-handler');
const qr = require('qrcode');
const fs = require('fs')
const qrcode = require('qrcode');
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where files will be saved
    },
    filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
    }
   });



// Add a route to get all projects
const getAllProjects = asyncHandler(async (req, res) => {
    try {
        // Fetch all projects from the database
        const projects = await Project.find().exec();

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})
////////////////////////////////////////////////Teacher//////////////////////////////////////////////

////by Teacher
const createProjectText = asyncHandler(async (req, res) => {
    const { title, groop, teacherName,module } = req.body;

    // Confirm data
    if (!title || !groop || !teacherName || !module) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create and store the project
        const project = await Project.create({ title, groop, module,teacherName });

        if (project) {
            res.status(201).json({ message: 'Project created successfully' });
        } else {
            res.status(400).json({ message: 'Failed to create the project' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//By the teacher
const deleteProjectText = asyncHandler(async (req, res) => {
    const { projectId } = req.body;
  
    // Confirm data
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }
  
    try {
      // Find the project by ID and delete it
      const project = await Project.findByIdAndDelete(projectId);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  //By the teacher
  const updateProjectText = asyncHandler(async (req, res) => {
    const { projectId, title, teacherName, groop, module } = req.body;

    // Confirm data
    if (!projectId || !title || !teacherName || !groop || !module) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find the existing project by ID
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Update project information
        project.title = title;
        project.teacherName = teacherName;
        project.groop = groop;
        project.module = module;

        // Save the updated project
        await project.save();

        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//By teacher
const activateProject = async (req, res) => {
    try {
      const { id } = req.body;
  
      // Confirm data 
      if (!id) {
        return res.status(400).json({ message: 'Project ID is required' });
      }
  
      // Find the project in the database by its ID
      const project = await Project.findById(id).exec();
  
      // Check if the project exists
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Update the 'active' status to true
      project.active = true;
  
      // Save the updated project
      await project.save();
  
      console.log("Project activated successfully:", id);
      return res.status(200).json({ message: 'Project activated successfully' });
    } catch (error) {
      console.error("Error activating project:", error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  



/////////////////////////////////Student////////////////////////////////////////////////////////////////////////////////////


const postCreateProject = asyncHandler(async (req, res) => {
    console.log('Received request body:', req.body);
    const { title, teacherName, module, studentId, fileContent } = req.body;

    // Validate data
    if (!title || !teacherName || !module || !studentId ) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new project
        const project = new Project({
            title,
            teacherName,
            module,
            studentId,
        });

        // Save the project to the database
        await project.save();
        console.log('Project saved:', project);

        // Specify the directories where you want to save the files
        const pdfsDir = path.join(__dirname, 'pdfs');
        const qrsDir = path.join(__dirname, 'qrs');

        // Ensure the directories exist, create if not
        if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir);
            console.log('Created directory:', pdfsDir);
        }
        if (!fs.existsSync(qrsDir)) {
            fs.mkdirSync(qrsDir);
            console.log('Created directory:', qrsDir);
        }

        // Define file paths
        const pdfFilePath = path.join(pdfsDir, `${project._id}.pdf`);
        const qrCodePath = path.join(qrsDir, `${project._id}.png`);

        // Save the file content to the pdf directory
        fs.writeFileSync(pdfFilePath, fileContent, 'base64');
        console.log('PDF saved to:', pdfFilePath);

        // Generate QR code
        const qrCodeText = project._id.toString();
        await qrcode.toFile(qrCodePath, qrCodeText);
        console.log('QR code generated and saved to:', qrCodePath);

        // Save QR code path and PDF path to the project
        project.qrCode = qrCodePath;
        project.pdfPath = pdfFilePath;

        // Save the project with updated fields to the database
        await project.save();
        console.log('Project updated with QR code and PDF paths:', project);

        res.status(201).json({ message: 'Project created successfully', projectId: project._id });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





const { memoryStorage } = require('multer');

const downloadQR = async (req, res) => {
    try {
        // Retrieve project ID from request parameters
        const projectId = req.params.projectId;

        // Find project by ID
        const project = await Project.findById(projectId);

        // If project not found
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Get QR code path from project
        const qrCodePath = project.qrCode;

        // If QR code path does not exist
        if (!qrCodePath) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        // Set the content type header for response
        res.setHeader('Content-Type', 'image/png');

        // Create a read stream from QR code path
        const stream = fs.createReadStream(qrCodePath);

        // Pipe the stream to response object
        stream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}; 








const CreateProject = asyncHandler(async (req, res) => {
    const { title, teacherName, module, studentId } = req.body;

    // Validate data
    if (!title || !teacherName || !module || !studentId) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new project
        const project = new Project({
            title,
        });

        // Save the project to the database
        await project.save();

        // Generate QR code
        const qrCodeText = project._id.toString();
        const qrCodePath = `qrs/${project._id}.png`;

        // Generate QR code image and save it
        await qrcode.toFile(qrCodePath, qrCodeText);

        // Save QR code path to the project
        project.qrCode = qrCodePath;

        // If PDF file is uploaded, handle it
        if (req.file) {
            // Read the contents of the PDF file
            const pdfData = req.file.buffer;

            // Save PDF data to the project
            project.pdfData = pdfData;
        }

        // Save the project with updated fields to the database
        await project.save();

        res.status(201).json({ message: 'Project created successfully', projectId: project._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




//delete By the student
const deleteProjectByStudent = async (req, res) => {
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        // Check if the project with the specified ID exists
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Perform validation to ensure that the delete request is from the student who created the project
        if (project.studentId.toString() !== req.Student.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete the project
        await project.remove();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Update Project by the student
const updateProjectByTheStudent = asyncHandler(async (req, res) => {
    const { projectId, title, teacherName, module, pdfFilePath } = req.body;
  
    // Confirm data
    if (!projectId || !title || !pdfFilePath || !teacherName || !module) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Retrieve the existing project by its ID
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Update project information
      project.title = title;
      project.pdfFilePath = pdfFilePath; // Use the new file path provided by multer
      project.teacherName = teacherName;
      project.module = module;
  
      // Generate new QR code
      const newQrCodeText = project._id.toString();
      const newQrCodePath = `qrs/${project._id}.png`;
  
      await qr.toFile(newQrCodePath, newQrCodeText);
  
      // Save the new QR code image path to the database
      project.qrCode = newQrCodePath;
  
      // Save the updated project
      await project.save();
  
      res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  ///////////////////////////////////////////////////////////////////////////////////////


// Add a route to get a project by ID
const getProjectById = asyncHandler(async (req, res) => {
    const projectId = req.params.id; // Extract the project ID from the request params

    try {
        // Fetch the project by its ID from the database
        const project = await Project.findById(projectId).exec();

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// Controller to get projects by teacher's name
const getProjectsByTeacherName = asyncHandler(async (req, res) => {
    const teacherName = req.params.teacherName; // Extract the teacher's name from the request params

    try {
        // Retrieve the teacher's user ID by their username
        const teacher = await Teacher.findOne({ username: teacherName }).exec();

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Fetch projects that have the specified teacher's ID
        const projects = await Project.find({ teacherId: teacher._id }).exec();

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for the specified teacher' });
        }

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// Controller to get projects by student ID
const getProjectsByStudentId = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId; // Extract the student's ID from the request params

    try {
        // Fetch projects that have the specified student's ID
        const projects = await Project.find({ studentId }).exec();

        if (!projects || projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for the specified student' });
        }

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const deleteAllProjects = asyncHandler(async (req, res) => {
    try {
        // Delete all projects
        const result = await Project.deleteMany();

        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'All projects deleted successfully' });
        } else {
            res.status(404).json({ message: 'No projects found to delete' });
        }
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const getImageByProjectId = async (req, res) => {
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        // Construct the path to the image file based on the project ID
        const imagePath = path.join(__dirname, 'qrs', `${projectId}.png`);

        // Check if the image file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Set the content type header for response
        res.setHeader('Content-Type', 'image/png');

        // Create a read stream from the image file
        const stream = fs.createReadStream(imagePath);

        // Pipe the stream to response object
        stream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getImageByProjectId,
    createProjectText,
    getAllProjects,
    getProjectById,
    getProjectsByStudentId,
    getProjectsByTeacherName,
    postCreateProject,
    updateProjectByTheStudent,
    getProjectsByStudentId,
    deleteAllProjects,
    downloadQR,
    CreateProject,
    activateProject,
    deleteProjectText,
    deleteProjectByStudent,
    updateProjectText,
};
