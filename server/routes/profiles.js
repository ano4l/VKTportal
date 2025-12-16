import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { dbHelpers } from '../database.js';

const router = express.Router();

// Get user's own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const profile = await dbHelpers.get(
      `SELECT ep.*, u.name, u.email, u.role
       FROM employee_profiles ep
       RIGHT JOIN users u ON ep.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!profile) {
      return res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update profile
router.post('/me', authenticateToken, async (req, res) => {
  try {
    const {
      phone,
      date_of_birth,
      address,
      city,
      postal_code,
      country,
      bank_name,
      bank_account_number,
      bank_account_type,
      branch_code,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      id_number,
      tax_number
    } = req.body;

    // Check if profile exists
    const existing = await dbHelpers.get(
      'SELECT id FROM employee_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing) {
      // Update existing profile
      await dbHelpers.run(
        `UPDATE employee_profiles SET
         phone = ?, date_of_birth = ?, address = ?, city = ?, postal_code = ?,
         country = ?, bank_name = ?, bank_account_number = ?, bank_account_type = ?,
         branch_code = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
         emergency_contact_relationship = ?, id_number = ?, tax_number = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [
          phone, date_of_birth, address, city, postal_code, country,
          bank_name, bank_account_number, bank_account_type, branch_code,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
          id_number, tax_number, req.user.id
        ]
      );
    } else {
      // Create new profile
      await dbHelpers.run(
        `INSERT INTO employee_profiles (
         user_id, phone, date_of_birth, address, city, postal_code, country,
         bank_name, bank_account_number, bank_account_type, branch_code,
         emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
         id_number, tax_number
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, phone, date_of_birth, address, city, postal_code, country,
          bank_name, bank_account_number, bank_account_type, branch_code,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
          id_number, tax_number
        ]
      );
    }

    const profile = await dbHelpers.get(
      `SELECT ep.*, u.name, u.email, u.role
       FROM employee_profiles ep
       INNER JOIN users u ON ep.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json(profile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

