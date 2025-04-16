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
    res.send(`<h3>Thanks, ${name}! Your info was saved.</h3>`);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).send('Error saving to database.');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
