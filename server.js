const express = require('express');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('views'));
app.use(express.static(path.join(__dirname, 'views')));


// DB Config
const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

app.post('/submit', async (req, res) => {
  const { name, email } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query`INSERT INTO Users (Name, Email) VALUES (${name}, ${email})`;
    res.status(200).json({ success: true, message: 'Data saved' });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ success: false, message: 'Error saving to database.' });
  }
});

// Route to fetch all user entries
app.get('/entries', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query`SELECT * FROM Users`;
    res.json(result.recordset);
  } catch (err) {
    console.error('DB Fetch Error:', err);
    res.status(500).send('Error retrieving data from database.');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
