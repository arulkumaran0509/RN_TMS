const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const seedPassword = process.env.TMS_SEED_PASSWORD;
const mongoose = require('mongoose');
const Role = require('./models/Role');
const User = require('./models/User');

const seedData = async () => {
    try {
        if (!seedPassword) {
            throw new Error('TMS_SEED_PASSWORD must be set in the backend environment to run the seed script.');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const rolesToCreate = [
            'SuperAdmin',
            'User',
            'Networking Staff',
            'Plumber',
            'Electrician',
            'Technical Staff'
        ];

        const roleMap = {};

        for (const roleName of rolesToCreate) {
            if (roleName === 'Technical Staff') {
                const oldRole = await Role.findOne({ roleName: 'Software Developer' });
                if (oldRole) {
                    oldRole.roleName = 'Technical Staff';
                    await oldRole.save();
                    console.log('SUCCESS: Renamed Software Developer to Technical Staff');
                }
            }

            let role = await Role.findOne({ roleName });
            if (!role) {
                role = new Role({ roleName });
                await role.save();
                console.log('SUCCESS: Role ' + roleName + ' created');
            } else {
                console.log('INFO: Role ' + roleName + ' already exists');
            }
            roleMap[roleName] = role._id;
        }

        const usersToCreate = [
            {
                userName: 'Super Admin',
                phoneNumber: '1234567890',
                email: 'admin@tms.com',
                password: seedPassword,
                roleName: 'SuperAdmin',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
            },
            {
                userName: 'Standard User',
                phoneNumber: '0987654321',
                email: 'user@tms.com',
                password: seedPassword,
                roleName: 'User',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
            },
            {
                userName: 'Networking John',
                phoneNumber: '1122334455',
                email: 'network@tms.com',
                password: seedPassword,
                roleName: 'Networking Staff',
                avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80'
            },
            {
                userName: 'Plumber Pete',
                phoneNumber: '3344556677',
                email: 'plumber@tms.com',
                password: seedPassword,
                roleName: 'Plumber',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
            },
            {
                userName: 'Electrician Ed',
                phoneNumber: '4455667788',
                email: 'electrician@tms.com',
                password: seedPassword,
                roleName: 'Electrician',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
            },
            {
                userName: 'Developer Dave',
                phoneNumber: '5566778899',
                email: 'developer@tms.com',
                password: seedPassword,
                roleName: 'Technical Staff',
                avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80'
            }
        ];

        for (const userData of usersToCreate) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                const newUser = new User({
                    userName: userData.userName,
                    phoneNumber: userData.phoneNumber,
                    email: userData.email,
                    password: userData.password,
                    avatar: userData.avatar,
                    roleId: roleMap[userData.roleName]
                });
                await newUser.save();
                console.log('SUCCESS: User ' + userData.email + ' created with avatar');
            } else {
                console.log('INFO: User ' + userData.email + ' already exists. Updating avatar...');
                userExists.password = userData.password;
                userExists.avatar = userData.avatar;
                await userExists.save();
                console.log('SUCCESS: Password and avatar updated for ' + userData.email);
            }
        }

        console.log('Seeding process complete.');
        process.exit(0);
    } catch (error) {
        console.error('FATAL SEED ERROR:', error);
        process.exit(1);
    }
};

seedData();
