const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');
const Role = require('../models/Role');
const User = require('../models/User');

// Generic CRUD handlers (Simplified for initial implementation)
const getAll = (Model) => async (req, res) => {
    try {
        let query = Model.find();

        // Populate common relational fields if they exist as keys in the schema paths
        const paths = Object.keys(Model.schema.paths);

        if (paths.includes('deptId')) query = query.populate('deptId');
        if (paths.includes('programmeId')) query = query.populate('programmeId');
        if (paths.includes('blockId')) query = query.populate('blockId');
        if (paths.includes('roleId')) query = query.populate('roleId');
        if (paths.includes('userId')) query = query.populate('userId');

        const items = await query;
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOne = (Model) => async (req, res) => {
    try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        if (error.code === 11000 || (error.name === 'MongoError' && error.code === 11000) || (error.name === 'MongoServerError' && error.code === 11000)) {
            const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
            return res.status(400).json({
                message: `${Model.modelName} with this ${field} already exists`
            });
        }
        res.status(400).json({ message: error.message });
    }
};

const deleteOne = (Model) => async (req, res) => {
    try {
        console.log(`Attempting to delete from ${Model.modelName}, ID: ${req.params.id}`);
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) {
            console.log(`Item not found in ${Model.modelName} for ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log(`Successfully deleted ${Model.modelName}`);
        res.json({ message: `${Model.modelName} deleted successfully` });
    } catch (error) {
        console.error(`Error deleting from ${Model.modelName}:`, error);
        res.status(500).json({ message: error.message });
    }
};

const updateOne = (Model) => async (req, res) => {
    try {
        console.log(`Updating ${Model.modelName} ID: ${req.params.id}`, req.body);
        const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) {
            console.log(`${Model.modelName} not found for ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log(`Successfully updated ${Model.modelName}`);
        res.json(item);
    } catch (error) {
        console.error(`Error updating ${Model.modelName}:`, error);
        if (error.code === 11000 || (error.name === 'MongoError' && error.code === 11000) || (error.name === 'MongoServerError' && error.code === 11000)) {
            const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
            return res.status(400).json({
                message: `${Model.modelName} with this ${field} already exists`
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Department
exports.getDepartments = getAll(Department);
exports.createDepartment = createOne(Department);
exports.updateDepartment = updateOne(Department);
exports.deleteDepartment = deleteOne(Department);

// Programme
exports.getProgrammes = getAll(Programme);
exports.createProgramme = createOne(Programme);
exports.updateProgramme = updateOne(Programme);
exports.deleteProgramme = deleteOne(Programme);

// Block
exports.getBlocks = getAll(Block);
exports.createBlock = createOne(Block);
exports.updateBlock = updateOne(Block);
exports.deleteBlock = deleteOne(Block);

// Room
exports.getRooms = getAll(Room);
exports.createRoom = createOne(Room);
exports.updateRoom = updateOne(Room);
exports.deleteRoom = deleteOne(Room);

// Role
exports.getRoles = getAll(Role);
exports.createRole = createOne(Role);
exports.updateRole = updateOne(Role);
exports.deleteRole = deleteOne(Role);

// User
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('roleId deptId programmeId');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUser = createOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
