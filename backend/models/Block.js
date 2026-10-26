const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    deptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    programmeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true
    },
    blockName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);
