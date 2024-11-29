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
    database: 'talonyhtiö_app', //!!!!!!!!!!!!
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Tietokantayhteys epäonnistui:', err);
        return;
    }
    console.log('Yhteys tietokantaan onnistui.');
});

const updateReservations = async () => {
  const currentTime = new Date();
  const queries = [
      `UPDATE autopaikat SET on_varattu = 0, rekisterinumero = NULL, varattu_pvm = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE pesukoneet SET on_varattu = 0, varaajan_nimi = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE kuivausrummut SET on_varattu = 0, varaajan_nimi = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE kuivaushuonevaraukset SET on_varattu = 0, käyttäjä_id = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`
    ];

    for (const query of queries) {
        await db.promise().query(query, [currentTime]);
    }
};


app.get('/api/complete-data', async (req, res) => {
  try {
      await updateReservations();

      const [parkingSpots] = await db.promise().query('SELECT * FROM autopaikat');
        const [washers] = await db.promise().query('SELECT * FROM pesukoneet');
        const [dryers] = await db.promise().query('SELECT * FROM kuivausrummut');
        const [dryingRoomSections] = await db.promise().query('SELECT * FROM kuivaushuonevaraukset');

      res.json({
          parkingSpots,
          washers,
          dryers,
          dryingRoomSections,
      });
  } catch (error) {
      console.error('Virhe tietojen haussa:', error);
      res.status(500).json({ message: 'Tietojen haku epäonnistui.' });
  }
});

// Yhteinen varaus
const reserveItem = (table, idField, id, extraField, extraValue, res) => {
  if (!id || !extraValue) {
    return res.status(400).send(`Varaus epäonnistui: ${idField} tai ${extraField} puuttuu.`);
  }

  // const vapautusAika = new Date(Date.now() + 60 * 60 * 1000); // Tunnin varaus
  const vapautusAika = new Date(Date.now() + 60 * 1000); // 1 minuutin varaus
  const query = `UPDATE ${table} SET on_varattu = 1, ${extraField} = ?, vapautus_aika = ? WHERE ${idField} = ? AND on_varattu = 0`;

  db.query(query, [extraValue, vapautusAika, id], (err, result) => {
      if (err) {
          console.error(`Virhe varattaessa: ${err}`);
          res.status(500).send('Virhe varattaessa.');
      } else if (result.affectedRows === 0) {
          res.status(400).send('Ei saatavilla.');
      } else {
          res.status(200).send('Varaus onnistui.');
      }
  });
};

app.post('/api/reserve-parking', (req, res) => {
  const { paikka_id, rekisterinumero } = req.body;
  reserveItem('autopaikat', 'paikka_id', paikka_id, 'rekisterinumero', rekisterinumero, res);
});

app.post('/api/reserve-washer', (req, res) => {
  const { pesukone_id, varaajan_nimi } = req.body;
  reserveItem('pesukoneet', 'pesukone_id', pesukone_id, 'varaajan_nimi', varaajan_nimi, res);
});

app.post('/api/reserve-dryer', (req, res) => {
  const { kuivausrumpu_id, varaajan_nimi } = req.body;
  reserveItem('kuivausrummut', 'kuivausrumpu_id', kuivausrumpu_id, 'varaajan_nimi', varaajan_nimi, res);
});

app.post('/api/reserve-drying-room', (req, res) => {
  const { huoneenosio_id, käyttäjä_id } = req.body;
  reserveItem('kuivaushuonevaraukset', 'huoneenosio_id', huoneenosio_id, 'käyttäjä_id', käyttäjä_id, res);
});



// app.post('/api/reserve-parking', (req, res) => {
//     console.log('POST /api/reserve-parking called');
//     console.log('Request body:', req.body);
  
//     const { paikka_id, rekisterinumero } = req.body;
  
//     if (!paikka_id || !rekisterinumero) {
//       console.error('ID tai rekisterinumero puuttuu');
//       return res.status(400).send('ID ja rekisterinumero ovat pakollisia');
//     }
  
//     const query = 'UPDATE autopaikat SET on_varattu = 1, rekisterinumero = ? WHERE paikka_id = ?';
//     db.query(query, [rekisterinumero, paikka_id], (err, result) => {
//       if (err) {
//         console.error('Virhe autopaikan varaamisessa:', err);
//         return res.status(500).send('Virhe autopaikan varaamisessa');
//       }
//       console.log('Autopaikka varattu onnistuneesti:', result);
//       res.status(200).send('Autopaikka varattu onnistuneesti');
//     });
//   });
  
//   app.put('/api/release-parking', (req, res) => {
//     console.log('PUT /api/release-parking called');
//     console.log('Request body:', req.body);
  
//     const { paikka_id } = req.body;
  
//     if (!paikka_id) {
//       console.error('ID puuttuu');
//       return res.status(400).send('ID on pakollinen');
//     }
  
//     const query = 'UPDATE autopaikat SET on_varattu = 0, rekisterinumero = NULL WHERE paikka_id = ?';
//     db.query(query, [paikka_id], (err, result) => {
//       if (err) {
//         console.error('Virhe autopaikan vapauttamisessa:', err);
//         return res.status(500).send('Virhe autopaikan vapauttamisessa');
//       }
//       console.log('Autopaikka vapautettu onnistuneesti:', result);
//       res.status(200).send('Autopaikka vapautettu onnistuneesti');
//     });
//   });

//   app.post('/api/reserve-washer', (req, res) => {
//     const { pesukone_id } = req.body;
//     const query = 'UPDATE pesukoneet SET on_varattu = 1 WHERE pesukone_id = ?';
//     db.query(query, [pesukone_id], (err, result) => {
//       if (err) {
//         console.error('Virhe pesukoneen varaamisessa:', err);
//         res.status(500).send('Virhe pesukoneen varaamisessa');
//         return;
//       }
//       console.log('pesukone varattu onnistuneesti:', result);
//       res.status(200).send('Pesukone varattu onnistuneesti');
//     });
//   });

//   app.put('/api/release-washer', (req, res) => {
//     const { pesukone_id } = req.body;
//     if (!pesukone_id) {
//       console.error('Pesukone ID puuttuu');
//       return res.status(400).send('Pesukone ID on pakollinen');
//   }
//     const query = 'UPDATE pesukoneet SET on_varattu = 0 WHERE pesukone_id = ?';
//     db.query(query, [pesukone_id], (err, result) => {
//       if (err) {
//         console.error('Virhe pesukoneen vapauttamisessa:', err);
//         res.status(500).send('Virhe pesukoneen vapauttamisessa');
//         return;
//       }
//       console.log('pesukone vapautettu onnistuneesti:', result);
//       res.status(200).send('Pesukone vapautettu onnistuneesti');
//     });
//   });

// // Kuivausrummun varaus ja vapautus
// app.post('/api/reserve-dryer', (req, res) => {
//   const { kuivausrumpu_id } = req.body;
//   const query = 'UPDATE kuivausrummut SET on_varattu = 1 WHERE kuivausrumpu_id = ?';
//   db.query(query, [kuivausrumpu_id], (err, result) => {
//     if (err) {
//       console.error('Virhe kuivausrummun varaamisessa:', err);
//       res.status(500).send('Virhe kuivausrummun varaamisessa');
//       return;
//     }
//     console.log('kuivausrumpu varattu onnistuneesti:', result);
//     res.status(200).send('kuivausrumpu varattu onnistuneesti');
//   });
// });

// app.put('/api/release-dryer', (req, res) => {
//   const { kuivausrumpu_id } = req.body;
//     if (!kuivausrumpu_id) {
//       console.error('kuivausrumpu ID puuttuu');
//       return res.status(400).send('kuivausrumpu ID on pakollinen');
//   }
//     const query = 'UPDATE kuivausrummut SET on_varattu = 0 WHERE kuivausrumpu_id = ?';
//     db.query(query, [kuivausrumpu_id], (err, result) => {
//       if (err) {
//         console.error('Virhe kuivausrummun vapauttamisessa:', err);
//         res.status(500).send('Virhe kuivausrummun vapauttamisessa');
//         return;
//       }
//       console.log('kuivausrumpu vapautettu onnistuneesti:', result);
//       res.status(200).send('kuivausrumpu vapautettu onnistuneesti');
//     });
//   });

// // Kuivaushuoneen osan varaus ja vapautus
// app.post('/api/reserve-drying-room', (req, res) => {
//   const { käyttäjä_id, huoneenosio_id } = req.body;
//   const query =
//     'UPDATE kuivaushuonevaraukset SET käyttäjä_id = ?, varattu_aika = NOW(), on_varattu = 1 WHERE huoneenosio_id = ? AND on_varattu = 0';
//   db.query(query, [käyttäjä_id, huoneenosio_id], (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Tietokantavirhe');
//     } else if (results.affectedRows === 0) {
//       res.status(400).send('Kuivaushuoneen osa ei ole saatavilla.');
//     } else {
//       res.send('Kuivaushuone varattu onnistuneesti.');
//     }
//   });
// });

// app.put('/api/release-drying-room', (req, res) => {
//   const { huoneenosio_id } = req.body;
//   const query =
//     'UPDATE kuivaushuonevaraukset SET käyttäjä_id = NULL, varattu_aika = NULL, on_varattu = 0 WHERE huoneenosio_id = ?';
//   db.query(query, [huoneenosio_id], (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Tietokantavirhe');
//     } else {
//       res.send('Kuivaushuone vapautettu onnistuneesti.');
//     }
//   });
// });


// // Reitti uuden autopaikan lisäämiseen
// app.post('/api/add-parking', (req, res) => {
//   const { nimi } = req.body;

//   if (!nimi) {
//       return res.status(400).send('Autopaikan nimi on pakollinen');
//   }

//   const query = 'INSERT INTO autopaikat (nimi, on_varattu, rekisterinumero) VALUES (?, 0, NULL)';
//   db.query(query, [nimi], (err, result) => {
//       if (err) {
//           console.error('Virhe autopaikan lisäämisessä:', err);
//           return res.status(500).send('Virhe autopaikan lisäämisessä');
//       }
//       console.log('Uusi autopaikka lisätty:', result);
//       res.status(201).send('Uusi autopaikka lisätty onnistuneesti');
//   });
// });


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});