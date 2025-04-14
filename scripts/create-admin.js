const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');

async function createDefaultAdmin() {
  const db = await open({
    filename: path.join(process.cwd(), 'data', 'database.sqlite'),
    driver: sqlite3.Database
  });

  const adminData = {
    adminId: 'ADM' + Date.now(),
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    email: 'admin@example.com',
    role: 'Super Admin',
    adminKey: process.env.ADMIN_REGISTRATION_KEY || 'admin-key-2024'
  };

  try {
    await db.run(
      'INSERT INTO admins (adminId, username, password, email, role) VALUES (?, ?, ?, ?, ?)',
      [adminData.adminId, adminData.username, adminData.password, adminData.email, adminData.role]
    );
    console.log('Default admin account created successfully');
    console.log('Username:', adminData.username);
    console.log('Password: admin123');
    console.log('Admin Key:', adminData.adminKey);
    console.log('\nKeep this admin key safe - you will need it to create additional admin accounts.');
  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await db.close();
  }
}

createDefaultAdmin().catch(console.error); 