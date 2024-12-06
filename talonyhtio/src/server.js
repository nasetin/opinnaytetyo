const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const port = 3001;
const secretKey = 'salainen-avain';

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

app.post('/api/login', async (req, res) => {
  const { email, salasana } = req.body;
  if(!email || !salasana) {
    return res.status(400).send('Email ja salasana vaaditaan');
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM käyttäjät WHERE email = ?', [email]);
    if(rows.length === 0) {
      return res.status(401).send('Väärä tunnus tai salasana');
    }
    const user = rows[0];
    const match = await bcrypt.compare(salasana, user.salasana);
    if(!match) {
      return res.status(401).send('Väärä tunnust tai salasana');
    }

    const token = jwt.sign({ käyttäjä_id: user.käyttäjä_id, email: user.email}, secretKey, {expiresIn: '1h'});

    res.json({ token });
  } catch (error) {
    console.error('Virhe kirjautumisessa:', error);
    res.status(500).send('Jotain meni pieleen');
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authotization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(!token) return res.status(401).send('Token puuttuu');

  jwt.verify(token, secretKey, (err, user) => {
    if(err) return res.status(403).send('Virheellinen token');
    req.user = user;
    next();
  });
}

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

app.get('/api/complete-data', authenticateToken, async (req, res) => {
  // Jos tänne päästiin, token on voimassa
  // Hae varausdata ja lähetä se
  const [parkingSpots] = await db.promise().query('SELECT * FROM autopaikat');
  const [washers] = await db.promise().query('SELECT * FROM pesukoneet');
  const [dryers] = await db.promise().query('SELECT * FROM kuivausrummut');
  const [dryingRoomSections] = await db.promise().query('SELECT * FROM kuivaushuonevaraukset');

  res.json({ parkingSpots, washers, dryers, dryingRoomSections });
});



// app.get('/api/complete-data', async (req, res) => {
//   try {
//       await updateReservations();

//       const [parkingSpots] = await db.promise().query('SELECT * FROM autopaikat');
//         const [washers] = await db.promise().query('SELECT * FROM pesukoneet');
//         const [dryers] = await db.promise().query('SELECT * FROM kuivausrummut');
//         const [dryingRoomSections] = await db.promise().query('SELECT * FROM kuivaushuonevaraukset');

//       res.json({
//           parkingSpots,
//           washers,
//           dryers,
//           dryingRoomSections,
//       });
//   } catch (error) {
//       console.error('Virhe tietojen haussa:', error);
//       res.status(500).json({ message: 'Tietojen haku epäonnistui.' });
//   }
// });


const reserveItem = (table, idField, id, res, extraFields = {}) => {
  // const vapautusAika = new Date(Date.now() + 60 * 60 * 1000); // 1 tunnin varaus
  const vapautusAika = new Date(Date.now() + 10 * 1000); // 10 sekunttia
  const setFields = ['on_varattu = 1', 'vapautus_aika = ?'];
  const values = [vapautusAika];

  console.log('reserveItem kutsuttu'); // Näyttää, että funktio käynnistyy
    console.log('Saapuneet parametrit:', { table, idField, id, extraFields });

  for (const [key, value] of Object.entries(extraFields)) {
      setFields.push(`${key} = ?`);
      values.push(value); // Lisää arvot oikein SQL-kyselyyn
  }

  values.push(id); // Lisätään id viimeiseksi

  const query = `UPDATE ${table} SET ${setFields.join(', ')} WHERE ${idField} = ? AND on_varattu = 0`;
  console.log('SQL-kysely:', query, values); // Debuggausta varten

  db.query(query, values, (err, result) => {
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
  console.log('POST /api/reserve-parking kutsuttu'); // Tämä loki pitäisi näkyä aina, kun frontend lähettää pyynnön
  console.log('Saapuva data:', req.body); // Näyttää, mitä dataa lähetetään backendille
  const { paikka_id, rekisterinumero } = req.body;
  if (!paikka_id || !rekisterinumero) {
      return res.status(400).send('Paikka ID ja rekisterinumero ovat pakollisia.');
  }
  reserveItem('autopaikat', 'paikka_id', paikka_id, res, { rekisterinumero });
});

app.post('/api/reserve-washer', (req, res) => {
  const { pesukone_id } = req.body;
  reserveItem('pesukoneet', 'pesukone_id', pesukone_id, res);
});

app.post('/api/reserve-dryer', (req, res) => {
  const { kuivausrumpu_id } = req.body;
  reserveItem('kuivausrummut', 'kuivausrumpu_id', kuivausrumpu_id, res);
});

app.post('/api/reserve-drying-room', (req, res) => {
  const { huoneenosio_id } = req.body;
  reserveItem('kuivaushuonevaraukset', 'huoneenosio_id', huoneenosio_id, res);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});