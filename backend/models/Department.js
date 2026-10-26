const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    deptName: {
        type: String,
        required: true,
        unique: true
    },
    deptShortName: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
