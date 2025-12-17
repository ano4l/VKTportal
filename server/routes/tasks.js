import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all tasks (admin sees all, employees see only assigned to them)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await dbHelpers.all(`
        SELECT t.*, 
               u1.name as assigned_to_name, u1.email as assigned_to_email,
               u2.name as created_by_name
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        ORDER BY t.created_at DESC
      `);
    } else {
      tasks = await dbHelpers.all(`
        SELECT t.*, 
               u1.name as assigned_to_name, u1.email as assigned_to_email,
               u2.name as created_by_name
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.assigned_to = ?
        ORDER BY t.created_at DESC
      `, [req.user.id]);
    }
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await dbHelpers.get(`
      SELECT t.*, 
             u1.name as assigned_to_name, u1.email as assigned_to_email,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has access (admin or assigned to them)
    if (req.user.role !== 'admin' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;

    if (!title || !assigned_to) {
      return res.status(400).json({ error: 'Title and assigned_to are required' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, status || 'pending', priority || 'normal', assigned_to, req.user.id, due_date || null]
    );

    const task = await dbHelpers.get(`
      SELECT t.*, 
             u1.name as assigned_to_name, u1.email as assigned_to_email,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [result.lastID]);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task (admin can update any, employees can update their own status)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await dbHelpers.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, status, priority, assigned_to, due_date } = req.body;
    
    // Employees can only update status
    if (req.user.role !== 'admin') {
      await dbHelpers.run(
        `UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?`,
        [status || task.status, status === 'completed' ? new Date().toISOString() : null, req.params.id]
      );
    } else {
      // Admin can update everything
      await dbHelpers.run(
        `UPDATE tasks SET 
         title = ?, description = ?, status = ?, priority = ?, 
         assigned_to = ?, due_date = ?, completed_at = ?
         WHERE id = ?`,
        [
          title || task.title,
          description !== undefined ? description : task.description,
          status || task.status,
          priority || task.priority,
          assigned_to || task.assigned_to,
          due_date !== undefined ? due_date : task.due_date,
          status === 'completed' ? new Date().toISOString() : (status !== 'completed' ? null : task.completed_at),
          req.params.id
        ]
      );
    }

    const updatedTask = await dbHelpers.get(`
      SELECT t.*, 
             u1.name as assigned_to_name, u1.email as assigned_to_email,
             u2.name as created_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [req.params.id]);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbHelpers.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

