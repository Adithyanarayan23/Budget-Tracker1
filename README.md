Budget Tracker (Node + MySQL)

A simple budget tracker with two pages:
- Main tracker (`/`) to enter income, edit weekly category budgets, and add transactions (stored in MySQL).
- Analytics (`/analytics`) showing this week’s daily spending (Mon–Sun), category usage this week, and recent transactions.

Features
- Data stored in MySQL (users, categories, transactions)
- Auto-creates database and tables on first run
- Inline category budget updates persist to SQL
- Transactions add/update/delete persist to SQL
- Analytics auto-refreshes and shows 7 daily bars for the current week

Requirements
- Node.js 18+
- MySQL 8+ running locally

Quick Start
1) Install dependencies
   powershell
   cd C:\Users\adith\Downloads\budget
   npm install

2) Start MySQL and confirm your credentials in `server.js` (top of file):
   - MYSQL_HOST = 'localhost'
   - MYSQL_USER = 'root'
   - MYSQL_PASSWORD = 'your_password'
   - MYSQL_DATABASE = 'budget_tracker'

3) Run the app
   powershell
   npm start

4) Open the app
   - Tracker: http://localhost:3000/
   - Analytics: http://localhost:3000/analytics

Notes
- The server auto-creates the `budget_tracker` database and required tables.
- A default user `me` is created on first visit; the username is stored in LocalStorage.
- Category budgets are treated as per-week values.

Scripts
- npm start: start the server
- npm run dev: start with nodemon (auto-restart on file changes)

API (high level)
- POST /api/user { username } → get/create user
- PUT /api/user/:userId/income { income }
- GET /api/user/:userId/categories → list categories
- PUT /api/category/:id { budget }
- GET /api/user/:userId/transactions → list
- POST /api/user/:userId/transactions { date, description, category, amount }
- PUT /api/transaction/:id { date, description, category, amount }
- DELETE /api/transaction/:id
- DELETE /api/user/:userId/reset → clear transactions and reset income
- GET /api/health → basic health

Troubleshooting
- Cannot GET /analytics: Ensure you started via `npm start` and hit http://localhost:3000/analytics
- No data in analytics: Make sure transactions are dated within the current week.
- MySQL errors: Verify credentials in `server.js` and that MySQL is running.

Publish to GitHub
1) Initialize (first time only)
   powershell
   cd C:\Users\adith\Downloads\budget
   git init
   git add .
   git commit -m "Initial commit: budget tracker + analytics"

2) Create repo on GitHub
   - Go to GitHub → New repository → name: budget-tracker (public or private)
   - Do NOT create a README on GitHub (we already have one)
   - Copy the remote URL (HTTPS recommended)

3) Add remote and push
   powershell
   git remote add origin https://github.com/<your-username>/budget-tracker.git
   git branch -M main
   git push -u origin main

4) Add collaborators
   - GitHub → Your repo → Settings → Collaborators and teams → Add people → enter GitHub usernames → set permissions (Write/Maintain).

Environment Variables (optional)
If you prefer not to hardcode credentials, replace constants with `process.env.*` and create a `.env` file. Example:
   env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=budget_tracker

Then load env in `server.js`:
   bash
   npm i dotenv
   // at top of server.js
   require('dotenv').config();


