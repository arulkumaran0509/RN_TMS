const Complaint = require('../models/Complaint');
const User = require('../models/User');

exports.createComplaint = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing. Ensure you are sending multipart/form-data.' });
        }
        const { blockId, roomNumber, complaintType, complaintRemarks } = req.body;

        // Handle file upload
        let attachment = null;
        if (req.file) {
            attachment = `/uploads/${req.file.filename}`;
        }

        // Get user's department
        const user = await User.findById(req.user.id);

        const complaint = new Complaint({
            userId: req.user.id,
            blockId,
            roomNumber,
            complaintType,
            complaintRemarks,
            attachment,
            deptId: user?.deptId || null
        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint raised successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user.id })
            .populate('blockId', 'blockName')
            .populate('assignedTo', 'userName')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('roleId');
        const role = user.roleId ? user.roleId.roleName : 'User';

        let query = {};
        if (role === 'User') {
            query = { userId: req.user.id };
        } else if (role !== 'SuperAdmin') {
            // Staff/Technician
            query = { assignedTo: req.user.id };
        }
        // SuperAdmin stays as empty query {}

        const total = await Complaint.countDocuments(query);
        const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
        const inProgress = await Complaint.countDocuments({
            ...query,
            status: { $in: ['Assigned', 'In-Progress'] }
        });
        const completed = await Complaint.countDocuments({
            ...query,
            status: { $in: ['Completed', 'Closed'] }
        });
        const rejected = await Complaint.countDocuments({
            ...query,
            status: 'Rejected'
        });

        const rate = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;

        const stats = {
            total,
            pending,
            inProgress,
            assigned: inProgress,
            completed,
            resolved: completed,
            closed: completed,
            rejected,
            resolutionRate: rate
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getComplaints = async (req, res) => {
    try {
        let query = {};
        const user = await User.findById(req.user.id).populate('roleId');
        const role = user.roleId.roleName;

        if (role === 'SuperAdmin') {
            // Can see all
            query = {};
        } else if (role === 'User') {
            // Can only see their own
            query = { userId: req.user.id };
        } else {
            // Staff/Technician: Strictly see ONLY complaints assigned to them
            query = { assignedTo: req.user.id };
        }

        const complaints = await Complaint.find(query)
            .populate('userId', 'userName phoneNumber')
            .populate('blockId', 'blockName')
            .populate('assignedTo', 'userName');
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.assignComplaint = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Logic: Cannot reassign if staff has changed status beyond 'Assigned'
        const lockedStatuses = ['In-Progress', 'Onhold', 'Completed'];
        if (lockedStatuses.includes(complaint.status)) {
            return res.status(400).json({ message: 'Cannot reassign after work has started or completed' });
        }

        complaint.assignedTo = assignedTo;
        complaint.status = 'Assigned';
        await complaint.save();

        res.json({ message: 'Complaint assigned successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body; // Usually 'Completed' for staff
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
        res.json({ message: 'Status updated successfully', complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
