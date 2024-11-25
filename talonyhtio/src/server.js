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

  app.post('/api/reserve-washer', (req, res) => {
    const { pesukone_id } = req.body;
    const query = 'UPDATE pesukoneet SET on_varattu = 1 WHERE pesukone_id = ?';
    db.query(query, [pesukone_id], (err, result) => {
      if (err) {
        console.error('Virhe pesukoneen varaamisessa:', err);
        res.status(500).send('Virhe pesukoneen varaamisessa');
        return;
      }
      console.log('pesukone varattu onnistuneesti:', result);
      res.status(200).send('Pesukone varattu onnistuneesti');
    });
  });

  app.put('/api/release-washer', (req, res) => {
    const { pesukone_id } = req.body;
    if (!pesukone_id) {
      console.error('Pesukone ID puuttuu');
      return res.status(400).send('Pesukone ID on pakollinen');
  }
    const query = 'UPDATE pesukoneet SET on_varattu = 0 WHERE pesukone_id = ?';
    db.query(query, [pesukone_id], (err, result) => {
      if (err) {
        console.error('Virhe pesukoneen vapauttamisessa:', err);
        res.status(500).send('Virhe pesukoneen vapauttamisessa');
        return;
      }
      console.log('pesukone vapautettu onnistuneesti:', result);
      res.status(200).send('Pesukone vapautettu onnistuneesti');
    });
  });

// Kuivausrummun varaus ja vapautus
app.post('/api/reserve-dryer', (req, res) => {
  const { kuivausrumpu_id } = req.body;
  const query = 'UPDATE kuivausrummut SET on_varattu = 1 WHERE kuivausrumpu_id = ?';
  db.query(query, [kuivausrumpu_id], (err, result) => {
    if (err) {
      console.error('Virhe kuivausrummun varaamisessa:', err);
      res.status(500).send('Virhe kuivausrummun varaamisessa');
      return;
    }
    console.log('kuivausrumpu varattu onnistuneesti:', result);
    res.status(200).send('kuivausrumpu varattu onnistuneesti');
  });
});

app.put('/api/release-dryer', (req, res) => {
  const { kuivausrumpu_id } = req.body;
    if (!kuivausrumpu_id) {
      console.error('kuivausrumpu ID puuttuu');
      return res.status(400).send('kuivausrumpu ID on pakollinen');
  }
    const query = 'UPDATE kuivausrummut SET on_varattu = 0 WHERE kuivausrumpu_id = ?';
    db.query(query, [kuivausrumpu_id], (err, result) => {
      if (err) {
        console.error('Virhe kuivausrummun vapauttamisessa:', err);
        res.status(500).send('Virhe kuivausrummun vapauttamisessa');
        return;
      }
      console.log('kuivausrumpu vapautettu onnistuneesti:', result);
      res.status(200).send('kuivausrumpu vapautettu onnistuneesti');
    });
  });

// Kuivaushuoneen osan varaus ja vapautus
app.post('/api/reserve-drying-room', (req, res) => {
  const { käyttäjä_id, huoneenosio_id } = req.body;
  const query =
    'UPDATE kuivaushuonevaraukset SET käyttäjä_id = ?, varattu_aika = NOW(), on_varattu = 1 WHERE huoneenosio_id = ? AND on_varattu = 0';
  db.query(query, [käyttäjä_id, huoneenosio_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Tietokantavirhe');
    } else if (results.affectedRows === 0) {
      res.status(400).send('Kuivaushuoneen osa ei ole saatavilla.');
    } else {
      res.send('Kuivaushuone varattu onnistuneesti.');
    }
  });
});

app.put('/api/release-drying-room', (req, res) => {
  const { huoneenosio_id } = req.body;
  const query =
    'UPDATE kuivaushuonevaraukset SET käyttäjä_id = NULL, varattu_aika = NULL, on_varattu = 0 WHERE huoneenosio_id = ?';
  db.query(query, [huoneenosio_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Tietokantavirhe');
    } else {
      res.send('Kuivaushuone vapautettu onnistuneesti.');
    }
  });
});


// Reitti uuden autopaikan lisäämiseen
app.post('/api/add-parking', (req, res) => {
  const { nimi } = req.body;

  if (!nimi) {
      return res.status(400).send('Autopaikan nimi on pakollinen');
  }

  const query = 'INSERT INTO autopaikat (nimi, on_varattu, rekisterinumero) VALUES (?, 0, NULL)';
  db.query(query, [nimi], (err, result) => {
      if (err) {
          console.error('Virhe autopaikan lisäämisessä:', err);
          return res.status(500).send('Virhe autopaikan lisäämisessä');
      }
      console.log('Uusi autopaikka lisätty:', result);
      res.status(201).send('Uusi autopaikka lisätty onnistuneesti');
  });
});




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});