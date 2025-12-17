import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all announcements (active ones first)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let announcements;
    if (req.user.role === 'admin') {
      // Admin sees all announcements
      announcements = await dbHelpers.all(`
        SELECT a.*, u.name as created_by_name,
               GROUP_CONCAT(at.user_id) as target_user_ids
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN announcement_targets at ON a.id = at.announcement_id
        WHERE a.expires_at IS NULL OR a.expires_at > datetime('now')
        GROUP BY a.id
        ORDER BY 
          CASE a.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'normal' THEN 3
            ELSE 4
          END,
          a.created_at DESC
      `);
    } else {
      // Employees see general announcements (no targets) or announcements targeted to them
      announcements = await dbHelpers.all(`
        SELECT DISTINCT a.*, u.name as created_by_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN announcement_targets at ON a.id = at.announcement_id
        WHERE (a.expires_at IS NULL OR a.expires_at > datetime('now'))
          AND (at.user_id IS NULL OR at.user_id = ?)
        ORDER BY 
          CASE a.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'normal' THEN 3
            ELSE 4
          END,
          a.created_at DESC
      `, [req.user.id]);
    }
    
    // Parse target_user_ids for admin
    if (req.user.role === 'admin') {
      announcements = announcements.map(ann => ({
        ...ann,
        target_user_ids: ann.target_user_ids ? ann.target_user_ids.split(',').map(Number) : []
      }));
    }
    
    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single announcement
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const announcement = await dbHelpers.get(`
      SELECT a.*, u.name as created_by_name,
             GROUP_CONCAT(at.user_id) as target_user_ids
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_targets at ON a.id = at.announcement_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [req.params.id]);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    announcement.target_user_ids = announcement.target_user_ids 
      ? announcement.target_user_ids.split(',').map(Number) 
      : [];

    res.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create announcement (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, priority, expires_at, target_user_ids } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO announcements (title, content, priority, created_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, priority || 'normal', req.user.id, expires_at || null]
    );

    // Add target users if specified
    if (target_user_ids && Array.isArray(target_user_ids) && target_user_ids.length > 0) {
      for (const userId of target_user_ids) {
        await dbHelpers.run(
          'INSERT INTO announcement_targets (announcement_id, user_id) VALUES (?, ?)',
          [result.lastID, userId]
        );
      }
    }

    const announcement = await dbHelpers.get(`
      SELECT a.*, u.name as created_by_name,
             GROUP_CONCAT(at.user_id) as target_user_ids
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_targets at ON a.id = at.announcement_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [result.lastID]);

    announcement.target_user_ids = announcement.target_user_ids 
      ? announcement.target_user_ids.split(',').map(Number) 
      : [];

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, priority, expires_at, target_user_ids } = req.body;

    await dbHelpers.run(
      `UPDATE announcements 
       SET title = ?, content = ?, priority = ?, expires_at = ?
       WHERE id = ?`,
      [title, content, priority, expires_at, req.params.id]
    );

    // Update target users
    await dbHelpers.run('DELETE FROM announcement_targets WHERE announcement_id = ?', [req.params.id]);
    
    if (target_user_ids && Array.isArray(target_user_ids) && target_user_ids.length > 0) {
      for (const userId of target_user_ids) {
        await dbHelpers.run(
          'INSERT INTO announcement_targets (announcement_id, user_id) VALUES (?, ?)',
          [req.params.id, userId]
        );
      }
    }

    const announcement = await dbHelpers.get(`
      SELECT a.*, u.name as created_by_name,
             GROUP_CONCAT(at.user_id) as target_user_ids
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN announcement_targets at ON a.id = at.announcement_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [req.params.id]);

    announcement.target_user_ids = announcement.target_user_ids 
      ? announcement.target_user_ids.split(',').map(Number) 
      : [];

    res.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbHelpers.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

