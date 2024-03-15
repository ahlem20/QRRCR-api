const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: false
    },
    matricule: {
        type: String,
        required: false
    },
    university: {
        type: String,
        required: false
    },
    faculty: {
        type: String,
        required: false
    },
    departement: {
        type: String,
        required: false
    }, 
    teacherName: {
        type: String,
        required: false
    },
    spicaility: {
        type: String,
        required: false
    },
    annee: {
        type: String,
        required: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    groop: {
        type: String,
        required: false
    },
    module: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    teacherProof: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    module: {
        type: String,
        required: false
    },
    roles: {
        type: String,
        default: "student"
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('user', userSchema);
