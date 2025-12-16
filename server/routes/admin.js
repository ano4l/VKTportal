import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await dbHelpers.all(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbHelpers.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role || 'employee']
    );

    const user = await dbHelpers.get(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const userId = req.params.id;

    // Don't allow updating the admin user's role if it's the only admin
    if (role && role !== 'admin') {
      const user = await dbHelpers.get('SELECT role FROM users WHERE id = ?', [userId]);
      if (user && user.role === 'admin') {
        const adminCount = await dbHelpers.get(
          'SELECT COUNT(*) as count FROM users WHERE role = ?',
          ['admin']
        );
        if (adminCount.count <= 1) {
          return res.status(400).json({ error: 'Cannot remove the last admin user' });
        }
      }
    }

    await dbHelpers.run(
      'UPDATE users SET email = ?, name = ?, role = ? WHERE id = ?',
      [email, name, role, userId]
    );

    const updatedUser = await dbHelpers.get(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Don't allow deleting the last admin
    const user = await dbHelpers.get('SELECT role FROM users WHERE id = ?', [userId]);
    if (user && user.role === 'admin') {
      const adminCount = await dbHelpers.get(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await dbHelpers.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign users to project
router.post('/projects/:id/assign', async (req, res) => {
  try {
    const { user_ids } = req.body;
    const projectId = req.params.id;

    if (!Array.isArray(user_ids)) {
      return res.status(400).json({ error: 'user_ids must be an array' });
    }

    // Remove existing assignments
    await dbHelpers.run('DELETE FROM project_assignments WHERE project_id = ?', [projectId]);

    // Add new assignments
    for (const userId of user_ids) {
      await dbHelpers.run(
        'INSERT OR IGNORE INTO project_assignments (project_id, user_id) VALUES (?, ?)',
        [projectId, userId]
      );
    }

    // Get assigned users
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN project_assignments pa ON u.id = pa.user_id
      WHERE pa.project_id = ?
    `, [projectId]);

    res.json({ assigned_users: assignedUsers });
  } catch (error) {
    console.error('Error assigning users to project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assigned users for a project
router.get('/projects/:id/assignments', async (req, res) => {
  try {
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email, pa.assigned_at
      FROM users u
      INNER JOIN project_assignments pa ON u.id = pa.user_id
      WHERE pa.project_id = ?
    `, [req.params.id]);

    res.json(assignedUsers);
  } catch (error) {
    console.error('Error fetching project assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign users to meeting
router.post('/meetings/:id/assign', async (req, res) => {
  try {
    const { user_ids } = req.body;
    const meetingId = req.params.id;

    if (!Array.isArray(user_ids)) {
      return res.status(400).json({ error: 'user_ids must be an array' });
    }

    // Remove existing assignments
    await dbHelpers.run('DELETE FROM meeting_assignments WHERE meeting_id = ?', [meetingId]);

    // Add new assignments
    for (const userId of user_ids) {
      await dbHelpers.run(
        'INSERT OR IGNORE INTO meeting_assignments (meeting_id, user_id) VALUES (?, ?)',
        [meetingId, userId]
      );
    }

    // Get assigned users
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN meeting_assignments ma ON u.id = ma.user_id
      WHERE ma.meeting_id = ?
    `, [meetingId]);

    res.json({ assigned_users: assignedUsers });
  } catch (error) {
    console.error('Error assigning users to meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assigned users for a meeting
router.get('/meetings/:id/assignments', async (req, res) => {
  try {
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email, ma.assigned_at
      FROM users u
      INNER JOIN meeting_assignments ma ON u.id = ma.user_id
      WHERE ma.meeting_id = ?
    `, [req.params.id]);

    res.json(assignedUsers);
  } catch (error) {
    console.error('Error fetching meeting assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

