
const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const initRoles = async () => {
  try {
    console.log('Initializing roles...');

    const roles = [
      { name: 'admin' },        
      { name: 'manager' },     
      { name: 'storekeeper' }   
    ];

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      if (created) {
        console.log(`Created role: ${role.name}`);
      }
    }

    const userCount = await User.count();
    if (userCount === 0) {
      const adminRole = await Role.findOne({ where: { name: 'admin' } });

      await User.create({
        email: 'admin@warehouse.com',
        password_hash: await bcrypt.hash('admin123', 12),
        name: 'System Administrator',
        role_id: adminRole.id
      });

      console.log('Default admin user created: admin@warehouse.com / admin123');
    }

    console.log('Roles initialization completed');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = initRoles;
