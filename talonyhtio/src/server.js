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

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send('Token puuttuu');

  jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(403).send('Virheellinen token');
      req.user = user;
      next();
  });
}

app.post('/api/login', async (req, res) => {
  const { email, salasana } = req.body;
  console.log("Yritetään kirjautua sisään:", email, salasana); // DEBUG

  if (!email || !salasana) {
    return res.status(400).send('Email ja salasana vaaditaan');
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM käyttäjät WHERE email = ?', [email]);
    console.log("Hakutulos:", rows); // DEBUG

    if (rows.length === 0) {
      console.log("Käyttäjää ei löytynyt tällä emaililla"); // DEBUG
      return res.status(401).send('Väärä tunnus tai salasana');
    }

    const user = rows[0];
    console.log("Löydetty käyttäjä:", user); // DEBUG

    const match = await bcrypt.compare(salasana, user.salasana);
    console.log("Vertailun tulos (should be true jos oikein):", match); // DEBUG

    if (!match) {
      console.log("Salasana ei täsmännyt hashin kanssa"); // DEBUG
      return res.status(401).send('Väärä tunnus tai salasana');
    }

    const token = jwt.sign({ käyttäjä_id: user.käyttäjä_id, email: user.email, rooli: user.rooli }, secretKey, { expiresIn: '1h' });

    console.log("Kirjautuminen onnistui, token luotu"); // DEBUG
    // Palautetaan myös käyttäjän rooli
    res.json({ token, rooli: user.rooli });
  } catch (error) {
    console.error('Virhe kirjautumisessa:', error);
    res.status(500).send('Jotain meni pieleen');
  }
});



const updateReservations = async () => {
  const currentTime = new Date();
  const queries = [
      `UPDATE autopaikat SET on_varattu = 0, rekisterinumero = NULL, varattu_pvm = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE pesukoneet SET on_varattu = 0, varaajan_nimi = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE kuivausrummut SET on_varattu = 0, varaajan_nimi = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE kuivaushuonevaraukset SET on_varattu = 0, käyttäjä_id = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`,
      `UPDATE saunavuorot SET on_varattu = 0, käyttäjä_id = NULL, varattu_pvm = NULL, vapautus_aika = NULL WHERE on_varattu = 1 AND vapautus_aika <= ?`
    ];

    for (const query of queries) {
        await db.promise().query(query, [currentTime]);
    }
};

app.get('/api/complete-data', authenticateToken, async (req, res) => {
  await updateReservations();

  const [parkingSpots] = await db.promise().query('SELECT * FROM autopaikat');
  const [washers] = await db.promise().query('SELECT * FROM pesukoneet');
  const [dryers] = await db.promise().query('SELECT * FROM kuivausrummut');
  const [dryingRoomSections] = await db.promise().query('SELECT * FROM kuivaushuonevaraukset');
  const [saunaVuorot] = await db.promise().query('SELECT * FROM saunavuorot');

  res.json({ parkingSpots, washers, dryers, dryingRoomSections, saunaVuorot });
});

const reserveItem = (table, idField, id, res, extraFields = {}) => {
  // const vapautusAika = new Date(Date.now() + 60 * 60 * 1000); // 1 tunnin varaus
  const vapautusAika = new Date(Date.now() + 10 * 1000); // 10 sekunttia
  const setFields = ['on_varattu = 1', 'vapautus_aika = ?'];
  const values = [vapautusAika];

  console.log('reserveItem kutsuttu');
    console.log('Saapuneet parametrit:', { table, idField, id, extraFields });

  for (const [key, value] of Object.entries(extraFields)) {
      setFields.push(`${key} = ?`);
      values.push(value); 
  }

  values.push(id); 

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
  console.log('POST /api/reserve-parking kutsuttu'); 
  console.log('Saapuva data:', req.body); 
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

app.get('/api/user-profile', authenticateToken, async (req, res) => {
  const [rows] = await db.promise().query('SELECT nimi, email FROM käyttäjät WHERE käyttäjä_id = ?', [req.user.käyttäjä_id]);
  if (rows.length === 0) return res.status(404).send('Käyttäjää ei löytynyt');
  res.json(rows[0]);
});

app.post('/api/reserve-sauna', authenticateToken, async (req, res) => {
  const { varaus_id } = req.body;
  if (!varaus_id) return res.status(400).send('Varaus ID vaaditaan');

 
  const [rows] = await db.promise().query('SELECT * FROM saunavuorot WHERE varaus_id = ? AND on_varattu = 0', [varaus_id]);
  if (rows.length === 0) {
    return res.status(400).send('Ei saatavilla');
  }

  reserveItem('saunavuorot', 'varaus_id', varaus_id, res, {
    käyttäjä_id: req.user.käyttäjä_id,
    varattu_pvm: new Date()
  });
});

// Tietojen tallennus
app.post('/api/save', (req, res) => {
  const {
    carSpaces,
    washers,
    dryers,
    dryingRoom,
    //saunaDays,
    hasDryingRoom,
    hasSauna,
    saunaTimes
  } = req.body;

  // Tallennetaan autopaikat
  carSpaces.forEach(({ label, isGreen }) => {
    const varattu = isGreen ? 0 : 1;
    const sql = `INSERT INTO autopaikat (nimi, on_varattu) VALUES (?, ?)`;
    db.query(sql, [label, varattu], (err, result) => {
      if (err) console.error(err);
    });
  });

  // Tallennetaan pesukoneet
  washers.forEach(({ label, isGreen }) => {
    const varattu = isGreen ? 0 : 1;
    const sql = `INSERT INTO pesukoneet (nimi, on_varattu) VALUES (?, ?)`;
    db.query(sql, [label, varattu], (err, result) => {
      if (err) console.error(err);
    });
  });

  // Tallennetaan kuivausrummut
  dryers.forEach(({ label, isGreen }) => {
    const varattu = isGreen ? 0 : 1;
    const sql = `INSERT INTO kuivausrummut (nimi, on_varattu) VALUES (?, ?)`;
    db.query(sql, [label, varattu], (err, result) => {
      if (err) console.error(err);
    });
  });

  // Tallennetaan kuivaushuone
  if (hasDryingRoom) {
    dryingRoom.forEach(({ label, isGreen }) => {
      const varattu = isGreen ? 0 : 1;
      const sql = `INSERT INTO kuivaushuonevaraukset (kuivaushuone_osa, on_varattu) VALUES (?, ?)`;
      db.query(sql, [label, varattu], (err, result) => {
        if (err) console.error(err);
      });
    });
  }

  // Tallennetaan saunaTimes
  // saunaTimes on muotoa: [{ day: 'Maanantai', times: ['17:00','18:00']}, ... ]
  // lisätään jokainen aika saunavuorot-tauluun
  if (hasSauna) {
    saunaTimes.forEach((dayObj) => {
      const { day, times } = dayObj;
      times.forEach((time) => {
        // Lisätään rivi saunavuorot-tauluun
        // Oletetaan, että on_vapaana = 1 tarkoittaa että vuoro on varattavissa
        // viikonpaiva = day, kellonaika = time
        const sql = `INSERT INTO saunavuorot (viikonpaiva, kellonaika, on_varattu) VALUES (?,?,0)`;
        db.query(sql, [day, time], (err, result) => {
          if (err) console.error(err);
        });
      });
    });
  }

  res.send('Data tallennettu!');
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});