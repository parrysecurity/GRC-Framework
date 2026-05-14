const { Pool } = require('pg');
require('dotenv').config();

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // Maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Query helper function
const query = (text, params) => pool.query(text, params);

// Create tables if they don't exist
const initDatabase = async () => {
  const createTablesSQL = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'analyst',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );

    -- Risks table
    CREATE TABLE IF NOT EXISTS risks (
        id SERIAL PRIMARY KEY,
        risk_id VARCHAR(20) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        inherent_rating VARCHAR(20) NOT NULL,
        likelihood INTEGER CHECK (likelihood >= 1 AND likelihood <= 5),
        impact INTEGER CHECK (impact >= 1 AND impact <= 5),
        risk_score INTEGER,
        controls TEXT,
        residual_rating VARCHAR(20),
        treatment VARCHAR(20),
        owner VARCHAR(100),
        status VARCHAR(20),
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    -- Threats table
    CREATE TABLE IF NOT EXISTS threats (
        id SERIAL PRIMARY KEY,
        threat_id VARCHAR(20) UNIQUE NOT NULL,
        source VARCHAR(20),
        threat_type VARCHAR(50),
        vulnerability TEXT,
        affected_asset VARCHAR(100),
        likelihood INTEGER CHECK (likelihood >= 1 AND likelihood <= 5),
        impact INTEGER CHECK (impact >= 1 AND impact <= 5),
        risk_score INTEGER,
        linked_risk_id VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (linked_risk_id) REFERENCES risks(risk_id)
    );

    -- Treatment plans table
    CREATE TABLE IF NOT EXISTS treatments (
        id SERIAL PRIMARY KEY,
        risk_id VARCHAR(20) UNIQUE,
        strategy VARCHAR(20),
        action_plan TEXT,
        framework_mapping TEXT,
        kpi TEXT,
        kpi_percentage INTEGER DEFAULT 0,
        timeline VARCHAR(100),
        responsible VARCHAR(200),
        cost_estimate VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (risk_id) REFERENCES risks(risk_id)
    );

    -- Audit log table
    CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(50),
        table_name VARCHAR(50),
        record_id VARCHAR(20),
        old_data JSONB,
        new_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Insert default admin user if not exists (password: Admin123!)
    INSERT INTO users (username, email, password_hash, role)
    SELECT 'admin', 'admin@company.com', '$2b$10$YourHashWillBeGenerated', 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
  `;

  try {
    await query(createTablesSQL);
    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

module.exports = { query, initDatabase, pool };
