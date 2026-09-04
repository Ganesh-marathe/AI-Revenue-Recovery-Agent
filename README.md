# ReviveAI — AI Revenue Recovery Agent

> **Turn At-Risk Revenue Into Recovered Revenue**

ReviveAI is an AI-powered revenue recovery platform designed to identify payment risks, analyze overdue or failed invoices, recommend recovery actions, execute recovery workflows, and maintain a complete audit trail.

It combines **AI-driven decision intelligence, revenue-risk analysis, invoice monitoring, recovery case management, analytics, and secure authentication** into a modern SaaS-style dashboard.

---

## 🚀 Project Overview

Businesses lose revenue when invoices become overdue, payments fail, or customers delay payments.

ReviveAI addresses this problem by analyzing invoice and payment information and determining:

- Which invoices are at risk
- How much revenue is at risk
- Why the payment problem occurred
- What recovery action should be taken
- Which cases should receive higher priority
- Whether the recovery action was successfully executed

### Recovery Flow

```text
Invoice / Payment Data
        ↓
Revenue Risk Analysis
        ↓
Risk Level Detection
        ↓
AI Diagnosis
        ↓
Recovery Action Recommendation
        ↓
Recovery Case Creation
        ↓
Action Execution
        ↓
Audit Trail
        ↓
Revenue Recovery
✨ Key Features
🔐 Secure Authentication
User login
JWT-based authentication
Password hashing using Argon2
Protected backend APIs
Session persistence
Logout functionality
📊 Revenue Recovery Dashboard

The dashboard provides an overview of the revenue recovery system.

It includes:

Total Revenue
Revenue At Risk
Open Recovery Cases
Recovery Performance
Risk Overview
Recent Recovery Cases
Recovery Activity
🧾 Invoice Monitoring

ReviveAI provides centralized invoice monitoring.

Users can view:

Invoice ID
Customer
Invoice amount
Due date
Days overdue
Payment status
Revenue risk
Risk level

Users can also open invoice details and view related payment information.

💳 Payment Tracking

The platform tracks payment information associated with invoices.

Users can view:

Payment ID
Invoice
Customer
Payment amount
Payment status
Payment history
🤖 AI Recovery Intelligence

ReviveAI analyzes risky invoices and produces recovery recommendations.

Example:

Risk Level: HIGH

Diagnosis:
Payment failure detected.

Recommended Action:
Retry Payment

Priority:
HIGH

The AI recovery workflow helps prioritize cases and select appropriate recovery actions.

🚨 Recovery Cases

Recovery Cases represent invoices that require revenue recovery action.

Each case contains information such as:

Case ID
Invoice
Customer
Invoice amount
Payment status
Revenue at risk
Risk level
AI diagnosis
Recommended recovery action
Intervention priority
Case status
Recovery Case Lifecycle
OPEN
 ↓
AI ANALYSIS
 ↓
ACTION RECOMMENDED
 ↓
ACTION EXECUTED
 ↓
RECOVERY COMPLETED
🧠 AI Insights

The AI Insights section provides decision intelligence for revenue recovery.

It includes:

AI Risk Prediction
Recovery Probability
Recommended Actions
Top Risky Customers
Recovery Trends
AI Model Confidence
Recent AI Activity
Decision Engine insights
📈 Analytics

The Analytics section provides business-level recovery insights.

It includes:

Revenue at Risk
Recovery activity
Risk distribution
Action performance
Recovery trends
AI recovery intelligence
Period-based analysis
CSV export
📝 Audit Trail

Every executed recovery action is recorded in the audit trail.

Example:

Case ID: CASE-7
Action: Retry Payment
Status: EXECUTED
Message: Recovery action executed successfully

This provides traceability and helps users understand what actions were performed by the recovery system.

🏗️ System Architecture
                    ┌─────────────────────┐
                    │      React UI       │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ↓
                    ┌─────────────────────┐
                    │     FastAPI         │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ↓                ↓                ↓
       ┌────────────┐   ┌─────────────┐  ┌─────────────┐
       │ AI Recovery│   │   Revenue   │  │    Auth     │
       │   Engine   │   │ Risk Engine │  │    JWT      │
       └────────────┘   └─────────────┘  └─────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                    ┌─────────────────────┐
                    │       SQLite        │
                    │      Database       │
                    └─────────────────────┘
🛠️ Technology Stack
Frontend
React
Vite
JavaScript
CSS
REST API integration
Backend
Python
FastAPI
SQLAlchemy
JWT Authentication
Argon2 Password Hashing
Database
SQLite
Development Tools
Visual Studio Code
Git
GitHub
PowerShell
📁 Project Structure
revive-ai-revenue-recovery/
│
├── backend/
│   └── app/
│       ├── api/
│       │   ├── auth.py
│       │   ├── customers.py
│       │   ├── invoices.py
│       │   ├── payments.py
│       │   ├── recovery.py
│       │   └── analytics.py
│       │
│       ├── database/
│       ├── models/
│       ├── auth.py
│       ├── main.py
│       └── create_user.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── revenue_recovery.db
⚙️ Installation
1. Clone the Repository
git clone https://github.com/Ganesh-marathe/AI-Revenue-Recovery-Agent.git
cd AI-Revenue-Recovery-Agent
🐍 Backend Setup

Create and activate a Python virtual environment.

Windows
python -m venv .venv

Activate:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
🔑 Environment Variables

Create a .env file inside the project root:

SECRET_KEY=your-secret-key

⚠️ Never commit the .env file to GitHub.

The project .gitignore is configured to exclude environment files.

▶️ Start Backend

From the project root:

python -m uvicorn backend.app.main:app --reload --port 8001

Backend:

http://127.0.0.1:8001

FastAPI documentation:

http://127.0.0.1:8001/docs
⚛️ Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The frontend will normally run at:

http://localhost:5173
🔐 Demo Login

For local development:

Username: admin
Password: ReviveAI@123

Change demo credentials before using the application in a real production environment.

🔌 API Modules

The backend provides REST APIs for:

Authentication
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
Customers
GET /api/customers/
Invoices
GET  /api/invoices/
GET  /api/invoices/{invoice_id}
POST /api/invoices/
Payments
GET  /api/payments/
GET  /api/payments/{payment_id}
GET  /api/payments/invoice/{invoice_id}
POST /api/payments/
Recovery
GET  /api/recovery/status
GET  /api/recovery/analyze/{invoice_id}
POST /api/recovery/cases/{case_id}/execute
GET  /api/recovery/audit-logs
Analytics
GET /api/analytics/summary
GET /api/analytics/revenue-risk
🎯 Risk Classification

ReviveAI categorizes revenue risk into levels.

HIGH
 ↓
Critical revenue recovery priority

MEDIUM
 ↓
Requires monitoring and recovery action

LOW
 ↓
Lower immediate recovery risk

The risk assessment considers invoice/payment information and recovery conditions.

🔄 Recovery Example

Suppose a customer has:

Invoice Amount: ₹50,000
Payment Status: Failed

ReviveAI analyzes the case:

Payment Failure
       ↓
Revenue Risk Analysis
       ↓
HIGH Risk
       ↓
AI Diagnosis
       ↓
Retry Payment
       ↓
Execute Recovery Action
       ↓
Audit Log Created

This creates a traceable recovery workflow.

🛡️ Security

The application includes:

JWT authentication
Protected API endpoints
Password hashing
Environment-based secret configuration
.env excluded from Git
Authenticated frontend API requests
🧪 Testing

The main application modules can be tested through:

Backend API Documentation
http://127.0.0.1:8001/docs

Test:

Authentication
Customers
Invoices
Payments
Recovery
Analytics

The frontend can be tested through the main dashboard and its navigation pages.

💡 Why ReviveAI?

Traditional invoice systems mainly show overdue invoices.

ReviveAI goes one step further:

Detect
  ↓
Analyze
  ↓
Predict
  ↓
Recommend
  ↓
Execute
  ↓
Track

This transforms revenue recovery from a manual monitoring process into an intelligent decision-support workflow.

🚀 Future Improvements

Potential future enhancements include:

Machine-learning based risk prediction
Real payment gateway integration
Automated email/SMS reminders
Customer behavior prediction
Advanced recovery probability models
Real-time notifications
PostgreSQL production database
Role-based access control
Background AI agents
Cloud deployment
Docker support
Advanced reporting
Model monitoring and evaluation
📌 Project Status

Status: Completed

ReviveAI currently provides an integrated revenue recovery platform with:

Secure authentication
Dashboard
Customer management
Invoice monitoring
Payment tracking
AI recovery analysis
Recovery case management
Recovery action execution
Audit trail
AI insights
Analytics
👨‍💻 Author

Ganesh Marathe

AI / Data Science Project

GitHub:

https://github.com/Ganesh-marathe/AI-Revenue-Recovery-Agent