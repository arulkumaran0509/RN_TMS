const mongoose = require('mongoose');

const programmeSchema = new mongoose.Schema({
    deptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    programmeName: {
        type: String,
        required: true
    },
    programmeShortName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Programme', programmeSchema);
