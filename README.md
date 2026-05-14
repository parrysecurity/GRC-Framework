# 🛡️ GRC Risk Assessment Framework

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/parrysecurity/GRC-Framework)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1.svg)](https://postgresql.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Accessing the Application](#accessing-the-application)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 📖 Overview

The **GRC Risk Assessment Framework** is an enterprise-grade web application for Governance, Risk, and Compliance management. It helps organizations identify, assess, mitigate, and monitor risks through an intuitive dashboard, interactive heat maps, and comprehensive risk registers.

**Use Cases:**
- Enterprise risk management
- Compliance monitoring (ISO 31000, NIST, COBIT)
- Internal audit preparation
- Risk reporting to leadership
- Security team risk tracking

## ✨ Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Real-time risk metrics, KPIs, and trend analysis |
| 🔥 **Risk Heat Map** | 5x5 Likelihood vs Impact matrix with color coding |
| 📋 **Risk Register** | Complete CRUD operations for all risks |
| 🦠 **Threat Landscape** | Track threats, vulnerabilities, and affected assets |
| 💊 **Treatment Register** | Action plans with KPIs, timelines, and cost estimates |
| 🧮 **Risk Calculator** | Interactive tool for calculating risk scores |
| 📚 **Documentation** | Policies, procedures, and governance framework |
| 🔐 **Authentication** | JWT-based secure login system |
| 📝 **Audit Logging** | Track all changes to risk data |

### Risk Categories
- Cyber Security
- Operational
- Compliance
- Financial
- Strategic

### Risk Treatment Strategies
- **Mitigate** - Reduce risk through controls
- **Transfer** - Move risk (insurance, outsourcing)
- **Accept** - Live with the risk
- **Avoid** - Eliminate the risk activity

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Security** | Helmet, CORS, Rate Limiting |
| **Process Manager** | PM2 (production) |

## 📋 Prerequisites

Before installing, ensure you have:

```bash
# Node.js (v18 or higher)
node --version

# PostgreSQL (v15 or higher)
psql --version

# Git
git --version
🚀 Installation
Step 1: Clone the Repository
bash
git clone https://github.com/parrysecurity/GRC-Framework.git
cd GRC-Framework
Step 2: Install Backend Dependencies
bash
cd backend
npm install
Step 3: Install PM2 (Production - Optional)
bash
npm install -g pm2
⚙️ Configuration
Step 1: Create Environment File
bash
cp .env.example .env
Step 2: Configure Database
Edit the .env file with your credentials:

env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=grc_risk_framework

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (Generate a random string)
JWT_SECRET=your_super_secret_key_change_this

# CORS Settings
CORS_ORIGIN=*
Step 3: Create Database
bash
# Login to PostgreSQL
sudo -u postgres psql

# Run these commands inside PostgreSQL
CREATE DATABASE grc_risk_framework;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE grc_risk_framework TO your_db_user;
\q
Step 4: Create Database Tables
bash
# Connect to your database
sudo -u postgres psql -d grc_risk_framework

# Run the following SQL
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    risk_id VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    inherent_rating VARCHAR(20),
    likelihood INTEGER CHECK (likelihood BETWEEN 1 AND 5),
    impact INTEGER CHECK (impact BETWEEN 1 AND 5),
    risk_score INTEGER,
    controls TEXT,
    residual_rating VARCHAR(20),
    treatment VARCHAR(20),
    owner VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO risks (risk_id, category, description, likelihood, impact, risk_score, status) VALUES
('RSK-001', 'Cyber', 'Data breach risk', 4, 5, 20, 'Open'),
('RSK-002', 'Operational', 'Vendor failure', 3, 4, 12, 'In Progress'),
('RSK-003', 'Compliance', 'GDPR violation', 3, 5, 15, 'Monitored');

\q
🏃 Running the Application
Development Mode
bash
cd backend
npm start
Production Mode with PM2
bash
cd backend
pm2 start server.js --name grc-api
pm2 save
pm2 startup

# View logs
pm2 logs grc-api

# Restart
pm2 restart grc-api

# Stop
pm2 stop grc-api
Run as Background Service (Systemd)
Create service file:

bash
sudo nano /etc/systemd/system/grc-risk.service
Add this content:

ini
[Unit]
Description=GRC Risk Framework API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/grc-risk-framework/backend
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
Enable and start:

bash
sudo systemctl enable grc-risk
sudo systemctl start grc-risk
sudo systemctl status grc-risk
🌐 Accessing the Application
Local Access
text
http://localhost:5000
Network Access (Other Computers)
text
http://YOUR_SERVER_IP:5000
Test API Endpoints
bash
# Health check
curl http://localhost:5000/api/health

# Get all risks
curl http://localhost:5000/api/risks

# Get single risk
curl http://localhost:5000/api/risks/RSK-001
🔌 API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/login	User login
Risks
Method	Endpoint	Description
GET	/api/risks	Get all risks
GET	/api/risks/:id	Get single risk
POST	/api/risks	Create new risk
PUT	/api/risks/:id	Update risk
DELETE	/api/risks/:id	Delete risk
Threats
Method	Endpoint	Description
GET	/api/threats	Get all threats
POST	/api/threats	Create threat
Treatments
Method	Endpoint	Description
GET	/api/treatments	Get all treatments
POST	/api/treatments	Create/update treatment
📁 Project Structure
text
grc-risk-framework/
│
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   ├── database.js            # Database connection
│   ├── .env.example           # Environment template
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   └── routes/
│       ├── auth.js            # Login routes
│       ├── risks.js           # Risk CRUD
│       ├── threats.js         # Threat management
│       └── treatments.js      # Treatment plans
│
├── frontend/
│   └── index.html             # Main dashboard
│
├── .gitignore                 # Git ignore rules
├── LICENSE                    # MIT License
└── README.md                  # This file
📸 Screenshots
Dashboard
https://via.placeholder.com/800x400?text=Dashboard+View

Risk Heat Map
https://via.placeholder.com/800x400?text=Risk+Heat+Map

Risk Register
https://via.placeholder.com/800x400?text=Risk+Register

🚢 Deployment
Deploy to Ubuntu Server
bash
# Copy files to server
scp -r grc-risk-framework user@your-server:/var/www/

# Install dependencies
cd /var/www/grc-risk-framework/backend
npm install --production

# Setup firewall
sudo ufw allow 5000
sudo ufw enable

# Start with PM2
pm2 start server.js --name grc-api
pm2 save
Deploy with Docker
bash
# Build image
docker build -t grc-risk-framework .

# Run container
docker run -d -p 5000:5000 --name grc-api grc-risk-framework
Deploy to Cloud (AWS/GCP/Azure)
Launch Ubuntu instance

Install Node.js and PostgreSQL

Clone repository

Configure environment variables

Set up reverse proxy with Nginx

Obtain SSL certificate (Let's Encrypt)

🔧 Troubleshooting
Issue: "Cannot GET /"
Solution: Server not running or frontend missing

bash
cd backend && node server.js
Issue: Port 5000 already in use
Solution: Kill process using the port

bash
sudo fuser -k 5000/tcp
Issue: Database connection failed
Solution: Check PostgreSQL credentials

bash
sudo systemctl status postgresql
psql -U your_user -d grc_risk_framework -c "SELECT 1"
Issue: Other computers can't access
Solution: Allow firewall and bind to all interfaces

bash
sudo ufw allow 5000
# Ensure server listens on 0.0.0.0
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit changes (git commit -m 'Add AmazingFeature')

Push to branch (git push origin feature/AmazingFeature)

Open a Pull Request

Coding Standards
Use ES6+ syntax

Follow REST API conventions

Write meaningful commit messages

Update documentation

📄 License
Distributed under the MIT License. See LICENSE file for more information.

📧 Contact
Author: parrysecurity

Project Link: https://github.com/parrysecurity/GRC-Framework

Issues: Report Bug

🙏 Acknowledgments
ISO 31000 Risk Management Guidelines

NIST Cybersecurity Framework

COBIT 2019 Framework

COSO ERM Framework

⭐ Star History
If you find this project useful, please give it a star on GitHub!

Built with ❤️ for enterprise risk management
