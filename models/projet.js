const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title:  {
        type: [String], // Allow an array of strings
        required: false,
      },
    module: {
        type: [String], // Allow an array of strings
        required: true,
      },
      groop: {
        type: [String], // Allow an array of strings
        required: true,
      },
    pdfFilePath: {
        type: String, // Change the type to Buffer
        required: false,
    },
    teacherName: {
        type: [String], // Allow an array of strings
        required: false,
      },
      studentId: {
        type: String,
        required: false,
        ref: 'User' // Reference to the User model
    },
   qrCode : {
        type: String,
        required: false
    },
    notes: {
        type: String
    },
    marke: {
        type: String
    },
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Project', projectSchema);
