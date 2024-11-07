const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 3001;

app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'talonyhtiö_app',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Tietokantayhteys epäonnistui:', err);
        return;
    }
    console.log('Yhteys tietokantaan onnistui.');
});

app.get('/api/parking-spots', (req, res) => {
    const query = 'SELECT * FROM autopaikat';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Virhe tietoja haettaessa:', err);
            res.status(500).send('Virhe tietoja haettaessa');
            return;
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});