import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all projects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await dbHelpers.all(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    
    // Get assigned users for each project
    for (const project of projects) {
      const assignedUsers = await dbHelpers.all(`
        SELECT u.id, u.name, u.email
        FROM users u
        INNER JOIN project_assignments pa ON u.id = pa.user_id
        WHERE pa.project_id = ?
      `, [project.id]);
      project.assigned_users = assignedUsers;
    }
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current projects (status = 'current')
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const projects = await dbHelpers.all(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.status = 'current'
      ORDER BY p.created_at DESC
    `);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching current projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming projects (status = 'upcoming')
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const projects = await dbHelpers.all(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.status = 'upcoming'
      ORDER BY p.start_date ASC
    `);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching upcoming projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await dbHelpers.get(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get assigned users
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN project_assignments pa ON u.id = pa.user_id
      WHERE pa.project_id = ?
    `, [project.id]);
    project.assigned_users = assignedUsers;
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, status, start_date, end_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO projects (title, description, status, start_date, end_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, status || 'upcoming', start_date || null, end_date || null, req.user.id]
    );

    const project = await dbHelpers.get(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [result.lastID]);

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status, start_date, end_date } = req.body;

    await dbHelpers.run(
      `UPDATE projects 
       SET title = ?, description = ?, status = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [title, description, status, start_date, end_date, req.params.id]
    );

    const project = await dbHelpers.get(`
      SELECT p.*, u.name as created_by_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbHelpers.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

