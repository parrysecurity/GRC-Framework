const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET all threats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM threats ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

// CREATE threat
router.post('/', authenticateToken, async (req, res) => {
  const {
    threat_id, source, threat_type, vulnerability,
    affected_asset, likelihood, impact, linked_risk_id
  } = req.body;

  const risk_score = likelihood * impact;

  try {
    const result = await query(
      `INSERT INTO threats (threat_id, source, threat_type, vulnerability,
       affected_asset, likelihood, impact, risk_score, linked_risk_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [threat_id, source, threat_type, vulnerability, affected_asset,
       likelihood, impact, risk_score, linked_risk_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create threat' });
  }
});

// UPDATE threat
router.put('/:id', authenticateToken, async (req, res) => {
  const {
    source, threat_type, vulnerability, affected_asset,
    likelihood, impact, linked_risk_id
  } = req.body;

  const risk_score = likelihood * impact;

  try {
    const result = await query(
      `UPDATE threats SET 
       source = $1, threat_type = $2, vulnerability = $3,
       affected_asset = $4, likelihood = $5, impact = $6,
       risk_score = $7, linked_risk_id = $8
       WHERE threat_id = $9 RETURNING *`,
      [source, threat_type, vulnerability, affected_asset,
       likelihood, impact, risk_score, linked_risk_id, req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update threat' });
  }
});

// DELETE threat
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await query('DELETE FROM threats WHERE threat_id = $1', [req.params.id]);
    res.json({ message: 'Threat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete threat' });
  }
});

module.exports = router;
