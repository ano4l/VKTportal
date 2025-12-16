import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get all requisitions (user sees their own, admin sees all)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let requisitions;
    if (req.user.role === 'admin') {
      requisitions = await dbHelpers.all(`
        SELECT pr.*, u.name as user_name, u.email as user_email,
               admin.name as processed_by_name
        FROM payment_requisitions pr
        LEFT JOIN users u ON pr.user_id = u.id
        LEFT JOIN users admin ON pr.processed_by = admin.id
        ORDER BY pr.created_at DESC
      `);
    } else {
      requisitions = await dbHelpers.all(`
        SELECT pr.*, u.name as user_name, u.email as user_email,
               admin.name as processed_by_name
        FROM payment_requisitions pr
        LEFT JOIN users u ON pr.user_id = u.id
        LEFT JOIN users admin ON pr.processed_by = admin.id
        WHERE pr.user_id = ?
        ORDER BY pr.created_at DESC
      `, [req.user.id]);
    }

    res.json(requisitions);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single requisition
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const requisition = await dbHelpers.get(`
      SELECT pr.*, u.name as user_name, u.email as user_email,
             admin.name as processed_by_name
      FROM payment_requisitions pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN users admin ON pr.processed_by = admin.id
      WHERE pr.id = ?
    `, [req.params.id]);

    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && requisition.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(requisition);
  } catch (error) {
    console.error('Error fetching requisition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create requisition
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      currency,
      type,
      priority,
      requested_date,
      required_date,
      justification
    } = req.body;

    if (!title || !description || !amount || !type || !requested_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await dbHelpers.run(
      `INSERT INTO payment_requisitions (
       user_id, title, description, amount, currency, type, priority,
       requested_date, required_date, justification
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, description, amount, currency || 'ZAR', type,
        priority || 'normal', requested_date, required_date || null, justification || null
      ]
    );

    const requisition = await dbHelpers.get(`
      SELECT pr.*, u.name as user_name, u.email as user_email
      FROM payment_requisitions pr
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE pr.id = ?
    `, [result.lastID]);

    res.status(201).json(requisition);
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update requisition status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    if (!['pending', 'approved', 'rejected', 'processing', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      processed_by: req.user.id,
      processed_at: new Date().toISOString()
    };

    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    await dbHelpers.run(
      `UPDATE payment_requisitions 
       SET status = ?, processed_by = ?, processed_at = ?, admin_notes = ?
       WHERE id = ?`,
      [status, req.user.id, updateData.processed_at, admin_notes || null, req.params.id]
    );

    const requisition = await dbHelpers.get(`
      SELECT pr.*, u.name as user_name, u.email as user_email,
             admin.name as processed_by_name
      FROM payment_requisitions pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN users admin ON pr.processed_by = admin.id
      WHERE pr.id = ?
    `, [req.params.id]);

    res.json(requisition);
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete requisition (only if pending and by owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const requisition = await dbHelpers.get(
      'SELECT user_id, status FROM payment_requisitions WHERE id = ?',
      [req.params.id]
    );

    if (!requisition) {
      return res.status(404).json({ error: 'Requisition not found' });
    }

    if (req.user.role !== 'admin' && requisition.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (requisition.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Can only delete pending requisitions' });
    }

    await dbHelpers.run('DELETE FROM payment_requisitions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Requisition deleted successfully' });
  } catch (error) {
    console.error('Error deleting requisition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

