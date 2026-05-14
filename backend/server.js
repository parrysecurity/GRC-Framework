const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static('/var/www/grc-risk-framework/frontend'));

// Simple API endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'GRC Risk API is running',
        timestamp: new Date().toISOString()
    });
});

// Sample risks API
app.get('/api/risks', (req, res) => {
    const risks = [
        {
            id: 'RSK-001',
            category: 'Cyber',
            description: 'Data breach risk',
            likelihood: 4,
            impact: 5,
            risk_score: 20,
            status: 'Open'
        },
        {
            id: 'RSK-002',
            category: 'Operational',
            description: 'Vendor failure',
            likelihood: 3,
            impact: 4,
            risk_score: 12,
            status: 'In Progress'
        },
        {
            id: 'RSK-003',
            category: 'Compliance',
            description: 'GDPR violation',
            likelihood: 3,
            impact: 5,
            risk_score: 15,
            status: 'Monitored'
        }
    ];
    res.json(risks);
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile('/var/www/grc-risk-framework/frontend/index.html');
});

// Start server on all interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ GRC Server is running!`);
    console.log(`📍 Access at: http://172.24.1.83:${PORT}`);
    console.log(`🔗 API test: http://172.24.1.83:${PORT}/api/risks`);
});
