const express = require('express');
const router = express.Router();
const { query } = require('../database');
const { authenticateToken } = require('../middleware/auth');

// GET all treatments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM treatments');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

// GET treatment by risk ID
router.get('/risk/:riskId', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM treatments WHERE risk_id = $1', [req.params.riskId]);
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch treatment' });
  }
});

// CREATE or UPDATE treatment
router.post('/', authenticateToken, async (req, res) => {
  const {
    risk_id, strategy, action_plan, framework_mapping,
    kpi, kpi_percentage, timeline, responsible, cost_estimate
  } = req.body;

  try {
    // Check if treatment exists
    const existing = await query('SELECT * FROM treatments WHERE risk_id = $1', [risk_id]);
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE treatments SET 
         strategy = $1, action_plan = $2, framework_mapping = $3,
         kpi = $4, kpi_percentage = $5, timeline = $6,
         responsible = $7, cost_estimate = $8, updated_at = CURRENT_TIMESTAMP
         WHERE risk_id = $9 RETURNING *`,
        [strategy, action_plan, framework_mapping, kpi, kpi_percentage,
         timeline, responsible, cost_estimate, risk_id]
      );
    } else {
      // Insert new
      result = await query(
        `INSERT INTO treatments (risk_id, strategy, action_plan, framework_mapping,
         kpi, kpi_percentage, timeline, responsible, cost_estimate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [risk_id, strategy, action_plan, framework_mapping, kpi,
         kpi_percentage, timeline, responsible, cost_estimate]
      );
    }
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save treatment' });
  }
});

module.exports = router;
