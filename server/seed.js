import { initDatabase, dbHelpers } from './database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Initializing database...');
  initDatabase();

  // Wait a bit for tables to be created
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Create admin user only
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await dbHelpers.run(
      'INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@virtukey.co.za', hashedPassword, 'Admin User', 'admin']
    );

    // Update existing user to admin if it exists
    await dbHelpers.run(
      'UPDATE users SET role = ? WHERE email = ?',
      ['admin', 'admin@virtukey.co.za']
    );

    console.log('Created admin user: admin@virtukey.co.za / password123');
    console.log('\nDatabase initialized successfully!');
    console.log('You can now register new employees or login with the admin account.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seed();
