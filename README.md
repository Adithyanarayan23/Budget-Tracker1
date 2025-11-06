# Budget Tracker

A full-stack budget tracking application built with Node.js, Express, and MySQL. Track your income, manage category budgets, record transactions, and view analytics with a modern, intuitive interface.

## Features

- 💰 **Income Management**: Set and track your monthly income
- 📊 **Category Budgets**: Manage weekly budgets for different spending categories
- 💳 **Transaction Tracking**: Add, edit, and delete expenses with date, description, category, and amount
- 📈 **Analytics Dashboard**: View daily spending charts, category breakdowns, and recent transactions
- 💾 **MySQL Backend**: All data is stored in MySQL database with automatic table creation
- 🔄 **Real-time Updates**: Analytics page auto-refreshes every 2 seconds
- 🎨 **Modern UI**: Clean, dark-themed interface with responsive design

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **MySQL** (version 8 or higher)
  - Download from: https://dev.mysql.com/downloads/mysql/
  - Or use MySQL Workbench: https://dev.mysql.com/downloads/workbench/
  - Verify installation: `mysql --version`

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Budget-Tracker1
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `express` - Web framework
- `mysql2` - MySQL database driver
- `cors` - Cross-origin resource sharing
- `body-parser` - Request body parsing
- `nodemon` - Development auto-reload (dev dependency)

### Step 3: Configure MySQL

1. **Start MySQL Service**
   - On Windows: Open Services (Win + R → `services.msc`) and start MySQL service
   - On Mac/Linux: `sudo systemctl start mysql` or use MySQL Workbench

2. **Update Database Credentials**
   
   Open `server.js` and update the MySQL configuration (lines 16-19):
   
   ```javascript
   const MYSQL_HOST = 'localhost';
   const MYSQL_USER = 'root';
   const MYSQL_PASSWORD = 'your_mysql_password';  // Change this!
   const MYSQL_DATABASE = 'budget_tracker';
   ```
   
   **Important**: Replace `'your_mysql_password'` with your actual MySQL root password.

3. **Verify MySQL Connection**
   
   Test your MySQL connection:
   ```bash
   mysql -u root -p
   ```
   Enter your password when prompted. If you can connect, you're good to go!

### Step 4: Run the Application

Start the server:

```bash
npm start
```

You should see:
```
Database initialized successfully
Server running on http://localhost:3000
```

If you see a database error, check:
- MySQL service is running
- Password in `server.js` is correct
- MySQL user has proper permissions

### Step 5: Access the Application

Open your web browser and navigate to:

- **Main Budget Tracker**: http://localhost:3000/
- **Analytics Dashboard**: http://localhost:3000/analytics

## Usage

### Main Tracker Page (`/`)

1. **Set Income**: Enter your monthly income in the "Planned Income" card
2. **Manage Categories**: Edit category budgets by clicking on the budget amount (inline editing)
3. **Add Transactions**: Click "+ Add expense" to add new transactions
4. **Edit/Delete**: Modify transaction details directly in the table or delete using the ✕ button
5. **View Analytics**: Click "Analytics →" button to view spending analytics

### Analytics Page (`/analytics`)

- **Daily Spending Chart**: Visual representation of spending for each day of the current week (Monday-Sunday)
- **Category Breakdown**: Table showing budget vs. spent for each category this week
- **Recent Transactions**: List of all transactions from the current week

The analytics page automatically refreshes every 2 seconds to show the latest data.

## Project Structure

```
Budget-Tracker1/
├── server.js              # Express server and API routes
├── budget_tracker.html    # Main tracker page
├── analytics.html         # Analytics dashboard
├── package.json           # Dependencies and scripts
├── package-lock.json      # Locked dependency versions
└── README.md             # This file
```

## API Endpoints

The server provides the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (returns server and database status) |
| POST | `/api/user` | Create or get user by username |
| PUT | `/api/user/:userId/income` | Update user income |
| GET | `/api/user/:userId/categories` | Get all categories for a user |
| PUT | `/api/category/:id` | Update category budget |
| GET | `/api/user/:userId/transactions` | Get all transactions for a user |
| POST | `/api/user/:userId/transactions` | Add a new transaction |
| PUT | `/api/transaction/:id` | Update a transaction |
| DELETE | `/api/transaction/:id` | Delete a transaction |
| GET | `/api/user/:userId/weekly-expenses` | Get weekly expense summary |
| DELETE | `/api/user/:userId/reset` | Reset all user data |

## Database Schema

The application automatically creates the following tables on first run:

- **users**: Stores user information (id, username, income)
- **categories**: Stores budget categories (id, user_id, name, budget)
- **transactions**: Stores expense transactions (id, user_id, date, description, category, amount)

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload (requires nodemon)

## Troubleshooting

### Server won't start

**Error: "Access denied for user 'root'@'localhost'"**
- Verify MySQL is running
- Check that the password in `server.js` matches your MySQL root password
- Test connection manually: `mysql -u root -p`

**Error: "Cannot find module"**
- Run `npm install` to install dependencies
- Make sure you're in the project directory

**Error: "Port 3000 already in use"**
- Another application is using port 3000
- Stop the other application or change the PORT in `server.js`

### Analytics page shows "Cannot reach backend"

- Ensure the server is running (`npm start`)
- Check browser console for errors
- Verify you're accessing http://localhost:3000/analytics (not /analytics.html)
- Check that MySQL is connected (look for "Database initialized successfully" in server logs)

### No data showing in analytics

- Make sure you've added transactions with dates in the current week
- Check that transactions have valid categories
- Verify the server is connected to MySQL (check server console)

### Database connection issues

- Ensure MySQL service is running
- Verify credentials in `server.js` are correct
- Check MySQL user permissions
- Try creating the database manually:
  ```sql
  CREATE DATABASE budget_tracker;
  ```

## Development

### Using Environment Variables (Recommended)

For better security, you can use environment variables instead of hardcoding credentials:

1. Install `dotenv`:
   ```bash
   npm install dotenv
   ```

2. Create a `.env` file in the project root:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=budget_tracker
   ```

3. Add to the top of `server.js`:
   ```javascript
   require('dotenv').config();
   ```

4. Update `server.js` to use environment variables:
   ```javascript
   const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
   const MYSQL_USER = process.env.MYSQL_USER || 'root';
   const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD;
   const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'budget_tracker';
   ```

**Important**: Add `.env` to your `.gitignore` file to avoid committing credentials!

## Notes

- The server automatically creates the `budget_tracker` database and all required tables on first run
- A default user with username `me` is created on first visit (stored in browser LocalStorage)
- Category budgets are treated as per-week values
- All data persists in MySQL database
- The application uses browser LocalStorage as a fallback if the backend is unavailable

## License

This project is open source and available for personal and educational use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Check server console logs for error messages
4. Ensure MySQL is running and credentials are correct

---

**Happy Budget Tracking! 💰📊**
