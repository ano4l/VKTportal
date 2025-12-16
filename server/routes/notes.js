import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all notes for user
router.get('/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await dbHelpers.all(
      'SELECT * FROM personal_notes WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create note
router.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content, color } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await dbHelpers.run(
      'INSERT INTO personal_notes (user_id, title, content, color) VALUES (?, ?, ?, ?)',
      [req.user.id, title || null, content, color || 'default']
    );

    const note = await dbHelpers.get('SELECT * FROM personal_notes WHERE id = ?', [result.lastID]);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update note
router.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, color } = req.body;
    
    // Verify ownership
    const note = await dbHelpers.get('SELECT user_id FROM personal_notes WHERE id = ?', [req.params.id]);
    if (!note || note.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await dbHelpers.run(
      'UPDATE personal_notes SET title = ?, content = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, content, color, req.params.id]
    );

    const updated = await dbHelpers.get('SELECT * FROM personal_notes WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete note
router.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await dbHelpers.get('SELECT user_id FROM personal_notes WHERE id = ?', [req.params.id]);
    if (!note || note.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await dbHelpers.run('DELETE FROM personal_notes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reminders for user
router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const reminders = await dbHelpers.all(
      `SELECT * FROM reminders 
       WHERE user_id = ? 
       ORDER BY 
         CASE WHEN is_completed = 0 THEN 0 ELSE 1 END,
         reminder_date ASC`,
      [req.user.id]
    );
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create reminder
router.post('/reminders', authenticateToken, async (req, res) => {
  try {
    const { title, description, reminder_date, priority } = req.body;
    if (!title || !reminder_date) {
      return res.status(400).json({ error: 'Title and reminder date are required' });
    }

    const result = await dbHelpers.run(
      'INSERT INTO reminders (user_id, title, description, reminder_date, priority) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description || null, reminder_date, priority || 'normal']
    );

    const reminder = await dbHelpers.get('SELECT * FROM reminders WHERE id = ?', [result.lastID]);
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reminder
router.put('/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, reminder_date, priority, is_completed } = req.body;
    
    const reminder = await dbHelpers.get('SELECT user_id FROM reminders WHERE id = ?', [req.params.id]);
    if (!reminder || reminder.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await dbHelpers.run(
      'UPDATE reminders SET title = ?, description = ?, reminder_date = ?, priority = ?, is_completed = ? WHERE id = ?',
      [title, description, reminder_date, priority, is_completed ? 1 : 0, req.params.id]
    );

    const updated = await dbHelpers.get('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete reminder
router.delete('/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await dbHelpers.get('SELECT user_id FROM reminders WHERE id = ?', [req.params.id]);
    if (!reminder || reminder.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await dbHelpers.run('DELETE FROM reminders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

