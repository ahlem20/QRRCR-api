const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projetController');
const verifyJWT = require('../middleware/verifyJWT');
const path = require('path');

router.use(verifyJWT);

// Route for getting all projects and creating a new project
router.route('/')
    .get(projectController.getAllProjects)
    .post(projectController.createProjectText)
    .patch(projectController.updateProjectByTheStudent)
    .delete(projectController.deleteAllProjects);

router.route('/Teacher')  
    .get(projectController.getProjectsByTeacherName) 
    .post(projectController.postCreateProject)
    .patch(projectController.updateProjectText)    
    .delete(projectController.deleteProjectText);  

router.route('/qr')
    .post(projectController.activateProject);

    // Define a route to download an image
    router.get('/qr',async (req, res) => {
        try {
        Images.find({}).then((data)=>{
            res.send({status:"ok",data});
        });
        } catch (error) {
           req.json({status:"error",error})
        }
    });
    
module.exports = router;
