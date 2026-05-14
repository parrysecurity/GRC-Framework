const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET all risks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM risks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// GET single risk by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM risks WHERE risk_id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Risk not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk' });
  }
});

// CREATE new risk
router.post('/', authenticateToken, async (req, res) => {
  const {
    risk_id, category, description, inherent_rating,
    likelihood, impact, controls, residual_rating,
    treatment, owner, status
  } = req.body;

  const risk_score = likelihood * impact;

  try {
    const result = await query(
      `INSERT INTO risks (risk_id, category, description, inherent_rating, 
       likelihood, impact, risk_score, controls, residual_rating, 
       treatment, owner, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [risk_id, category, description, inherent_rating, likelihood, impact,
       risk_score, controls, residual_rating, treatment, owner, status,
       req.user.id, req.user.id]
    );
    
    // Log to audit
    await query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, new_data) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'CREATE', 'risks', risk_id, JSON.stringify(result.rows[0])]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

// UPDATE risk
router.put('/:id', authenticateToken, async (req, res) => {
  const {
    category, description, inherent_rating, likelihood, impact,
    controls, residual_rating, treatment, owner, status
  } = req.body;

  const risk_score = likelihood * impact;

  try {
    // Get old data for audit
    const oldData = await query('SELECT * FROM risks WHERE risk_id = $1', [req.params.id]);
    
    const result = await query(
      `UPDATE risks SET 
       category = $1, description = $2, inherent_rating = $3,
       likelihood = $4, impact = $5, risk_score = $6, controls = $7,
       residual_rating = $8, treatment = $9, owner = $10, status = $11,
       updated_at = CURRENT_TIMESTAMP, updated_by = $12
       WHERE risk_id = $13 RETURNING *`,
      [category, description, inherent_rating, likelihood, impact, risk_score,
       controls, residual_rating, treatment, owner, status,
       req.user.id, req.params.id]
    );
    
    // Log to audit
    await query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, 'UPDATE', 'risks', req.params.id, JSON.stringify(oldData.rows[0]), JSON.stringify(result.rows[0])]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

// DELETE risk
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get data for audit
    const oldData = await query('SELECT * FROM risks WHERE risk_id = $1', [req.params.id]);
    
    await query('DELETE FROM risks WHERE risk_id = $1', [req.params.id]);
    
    await query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, old_data) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'DELETE', 'risks', req.params.id, JSON.stringify(oldData.rows[0])]
    );
    
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete risk' });
  }
});

module.exports = router;
