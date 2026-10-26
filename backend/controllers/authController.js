const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

exports.getPublicRoles = async (req, res) => {
    try {
        console.log('Fetching roles from DB...');
        const roles = await Role.find();
        console.log('Roles found: ' + roles.length);
        res.json(roles);
    } catch (error) {
        console.error('GET_ROLES_ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('roleId');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.roleId.roleName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar || '',
                role: user.roleId.roleName
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('roleId')
            .populate('deptId')
            .populate('programmeId')
            .select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userName, phoneNumber, avatar } = req.body;
        const updates = {};
        if (userName) updates.userName = userName;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (avatar !== undefined) updates.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
            .populate('roleId')
            .populate('deptId')
            .populate('programmeId')
            .select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('roleId').populate('deptId').populate('programmeId');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { userName, phoneNumber, email, password, roleName, deptId, programmeId, avatar } = req.body;

        const role = await Role.findOne({ roleName });
        if (!role) return res.status(400).json({ message: 'Role not found' });

        const user = new User({
            userName,
            phoneNumber,
            email,
            password,
            avatar: avatar || '',
            roleId: role._id,
            deptId,
            programmeId
        });

        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
