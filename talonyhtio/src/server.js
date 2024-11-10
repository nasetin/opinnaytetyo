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

// app.get('/api/parking-spots', (req, res) => {
//     const query = 'SELECT * FROM autopaikat';

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('Virhe tietoja haettaessa:', err);
//             res.status(500).send('Virhe tietoja haettaessa');
//             return;
//         }
//         res.json(results);
//     });
// });


app.get('/api/complete-data', (req, res) => {
    const parkingQuery = 'SELECT * FROM autopaikat';
    const washersQuery = 'SELECT * FROM pesukoneet';
    const dryersQuery = 'SELECT * FROM kuivausrummut';
    const dryingRoomSectionsQuery = 'SELECT * FROM kuivaushuonevaraukset';
    

    db.query(parkingQuery, (err, parkingResults) => {
        if (err) {
            console.error('Virhe parkkitietoja haettaessa:', err);
            res.status(500).send('Virhe parkkitietoja haettaessa');
            return;
        }

        db.query(washersQuery, (err, washersResults) => {
            if (err) {
                console.error('Virhe pesukoneiden haussa:', err);
                res.status(500).send('Virhe pesukoneiden haussa');
                return;
            }

            db.query(dryersQuery, (err, dryersResults) => {
                if (err) {
                    console.error('Virhe kuivausrumpujen haussa:', err);
                    res.status(500).send('Virhe kuivausrumpujen haussa');
                    return;
                }

                db.query(dryingRoomSectionsQuery, (err, dryingRoomSectionsResults) => {
                    if (err) {
                        console.error('Virhe kuivaushuoneen osien haussa:', err);
                        res.status(500).send('Virhe kuivaushuoneen osien haussa');
                        return;
                    }

        res.json({
            parkingSpots: parkingResults,
            washers: washersResults,
            dryers: dryersResults,
            dryingRoomSections: dryingRoomSectionsResults
        });
        });
    });
    });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});