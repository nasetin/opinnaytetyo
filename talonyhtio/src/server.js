const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

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

app.post('/api/reserve-parking', (req, res) => {
    console.log('POST /api/reserve-parking called');
    console.log('Request body:', req.body);
  
    const { paikka_id, rekisterinumero } = req.body;
  
    if (!paikka_id || !rekisterinumero) {
      console.error('ID tai rekisterinumero puuttuu');
      return res.status(400).send('ID ja rekisterinumero ovat pakollisia');
    }
  
    const query = 'UPDATE autopaikat SET on_varattu = 1, rekisterinumero = ? WHERE paikka_id = ?';
    db.query(query, [rekisterinumero, paikka_id], (err, result) => {
      if (err) {
        console.error('Virhe autopaikan varaamisessa:', err);
        return res.status(500).send('Virhe autopaikan varaamisessa');
      }
      console.log('Autopaikka varattu onnistuneesti:', result);
      res.status(200).send('Autopaikka varattu onnistuneesti');
    });
  });
  
  app.put('/api/release-parking', (req, res) => {
    console.log('PUT /api/release-parking called');
    console.log('Request body:', req.body);
  
    const { paikka_id } = req.body;
  
    if (!paikka_id) {
      console.error('ID puuttuu');
      return res.status(400).send('ID on pakollinen');
    }
  
    const query = 'UPDATE autopaikat SET on_varattu = 0, rekisterinumero = NULL WHERE paikka_id = ?';
    db.query(query, [paikka_id], (err, result) => {
      if (err) {
        console.error('Virhe autopaikan vapauttamisessa:', err);
        return res.status(500).send('Virhe autopaikan vapauttamisessa');
      }
      console.log('Autopaikka vapautettu onnistuneesti:', result);
      res.status(200).send('Autopaikka vapautettu onnistuneesti');
    });
  });


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});