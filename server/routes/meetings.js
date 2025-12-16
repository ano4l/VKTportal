import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all meetings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const meetings = await dbHelpers.all(`
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      ORDER BY m.meeting_date ASC
    `);
    
    // Get assigned users for each meeting
    for (const meeting of meetings) {
      const assignedUsers = await dbHelpers.all(`
        SELECT u.id, u.name, u.email
        FROM users u
        INNER JOIN meeting_assignments ma ON u.id = ma.user_id
        WHERE ma.meeting_id = ?
      `, [meeting.id]);
      meeting.assigned_users = assignedUsers;
    }
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming meetings
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const meetings = await dbHelpers.all(`
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.meeting_date >= datetime('now')
      ORDER BY m.meeting_date ASC
    `);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single meeting
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const meeting = await dbHelpers.get(`
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `, [req.params.id]);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Get assigned users
    const assignedUsers = await dbHelpers.all(`
      SELECT u.id, u.name, u.email
      FROM users u
      INNER JOIN meeting_assignments ma ON u.id = ma.user_id
      WHERE ma.meeting_id = ?
    `, [meeting.id]);
    meeting.assigned_users = assignedUsers;
    
    res.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meeting (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, meeting_date, location } = req.body;

    if (!title || !meeting_date) {
      return res.status(400).json({ error: 'Title and meeting date are required' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO meetings (title, description, meeting_date, location, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, meeting_date, location || null, req.user.id]
    );

    const meeting = await dbHelpers.get(`
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `, [result.lastID]);

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meeting
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, meeting_date, location } = req.body;

    await dbHelpers.run(
      `UPDATE meetings 
       SET title = ?, description = ?, meeting_date = ?, location = ?
       WHERE id = ?`,
      [title, description, meeting_date, location, req.params.id]
    );

    const meeting = await dbHelpers.get(`
      SELECT m.*, u.name as created_by_name
      FROM meetings m
      LEFT JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    res.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meeting (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbHelpers.run('DELETE FROM meetings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

