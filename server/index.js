import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { initDatabase, dbHelpers } from './database.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import meetingRoutes from './routes/meetings.js';
import commentRoutes from './routes/comments.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profiles.js';
import announcementRoutes from './routes/announcements.js';
import requisitionRoutes from './routes/requisitions.js';
import notesRoutes from './routes/notes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// Auto-seed admin user if it doesn't exist
async function ensureAdminUser() {
  try {
    // Wait a bit for tables to be created
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const admin = await dbHelpers.get('SELECT * FROM users WHERE email = ?', ['admin@virtukey.co.za']);
    
    if (!admin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('password123', 10);
      await dbHelpers.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@virtukey.co.za', hashedPassword, 'Admin User', 'admin']
      );
      console.log('✓ Admin user created: admin@virtukey.co.za / password123');
    } else if (admin.role !== 'admin') {
      // Update existing user to admin if role is wrong
      await dbHelpers.run('UPDATE users SET role = ? WHERE email = ?', ['admin', 'admin@virtukey.co.za']);
      console.log('✓ Admin user role updated');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
}

// Ensure admin user exists on server start
ensureAdminUser();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/requisitions', requisitionRoutes);
app.use('/api', notesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

