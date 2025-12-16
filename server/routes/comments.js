import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get comments for a project or meeting
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { project_id, meeting_id } = req.query;

    if (!project_id && !meeting_id) {
      return res.status(400).json({ error: 'project_id or meeting_id is required' });
    }

    let query = `
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE `;
    
    const params = [];
    if (project_id) {
      query += 'c.project_id = ?';
      params.push(project_id);
    } else {
      query += 'c.meeting_id = ?';
      params.push(meeting_id);
    }

    query += ' ORDER BY c.created_at ASC';

    const comments = await dbHelpers.all(query, params);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, project_id, meeting_id } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (!project_id && !meeting_id) {
      return res.status(400).json({ error: 'project_id or meeting_id is required' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO comments (content, user_id, project_id, meeting_id)
       VALUES (?, ?, ?, ?)`,
      [content, req.user.id, project_id || null, meeting_id || null]
    );

    const comment = await dbHelpers.get(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.lastID]);

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    // Check if comment belongs to user
    const comment = await dbHelpers.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    await dbHelpers.run(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, req.params.id]
    );

    const updatedComment = await dbHelpers.get(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if comment belongs to user
    const comment = await dbHelpers.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await dbHelpers.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

