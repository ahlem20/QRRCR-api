const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

// This route won't have authentication
router.route('/teacher')
  .post(userController.createNewteacher);

// These routes will have authentication
router.use(verifyJWT);

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewStudent)
  .delete(userController.deleteAllUsers);

router.route('/students')
  .get(userController.getAllstudents);

router.route('/:id')
  .get(userController.getStudentById);

module.exports = router;
