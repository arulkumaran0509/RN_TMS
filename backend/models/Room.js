const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
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
    blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
