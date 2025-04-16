const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { poolPromise } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

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

// GET homepage form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

// POST form data
app.post('/submit', async (req, res) => {
    try {
        const { name, email } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('name', name)
            .input('email', email)
            .query('INSERT INTO Users (Name, Email) VALUES (@name, @email)');

        res.send('<h2>Form submitted successfully!</h2><a href="/">Go Back</a><br><a href="/users">View All Users</a>');
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error saving data.');
    }
});

// GET all user data
app.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Users');

        let html = `<h2>All Users</h2><table border="1" cellpadding="10" style="border-collapse:collapse;"><tr><th>ID</th><th>Name</th><th>Email</th></tr>`;
        result.recordset.forEach(user => {
            html += `<tr><td>${user.ID}</td><td>${user.Name}</td><td>${user.Email}</td></tr>`;
        });
        html += `</table><br><a href="/">Go Back</a>`;
        res.send(html);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error retrieving users.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
