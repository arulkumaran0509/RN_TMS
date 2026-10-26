const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    },
    complaintType: {
        type: String,
        required: true,
        enum: ['PC Hardware', 'PC Software', 'Application Issues', 'Network', 'Electronics', 'Plumbing', 'Other']
    },
    complaintRemarks: {
        type: String,
        required: true
    },
    deptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    attachment: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Completed', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
