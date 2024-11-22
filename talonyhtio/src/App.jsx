import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
// import AppAdmin from './appAdmin';
import axios from 'axios';
import './App.css';

function App() {
  const [buttons, setButtons] = useState([]);
  const [washers, setWashers] = useState([]);
  const [dryers, setDryers] = useState([]);
  const [dryingRoomSections, setDryingRoomSections] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [rekisterinumero, setRekisterinumero] = useState('');
  // const [newParkingName, setNewParkingName] = useState('');

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/complete-data');
      setParkingSpots(response.data.parkingSpots);
      setWashers(response.data.washers);
      setDryers(response.data.dryers);
      setDryingRoomSections(response.data.dryingRoomSections);
    } catch (error) {
      console.error('Virhe tietojen haussa:', error);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);
  
  const handleReserve = async (paikka_id) => {
    if (!rekisterinumero.trim()) {
      alert('Syötä rekisterinumero');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/reserve-parking', {
        paikka_id,
        rekisterinumero
      });
      if (response.status === 200) {
        alert('Autopaikka varattu onnistuneesti!');
        fetchData();
      }
    } catch (error) {
      console.error('Virhe varauksessa:', error);
      alert('Varauksessa tapahtui virhe');
    }
  };

  const handleRelease = async (paikka_id) => {
    console.log('Release called with id:', paikka_id);
    try {
      const response = await axios.put('http://localhost:3001/api/release-parking', { paikka_id });
      if (response.status === 200) {
        alert('Autopaikka vapautettu onnistuneesti!');
        fetchData();
      }
    } catch (error) {
      console.error('Virhe vapautuksessa:', error);
      alert('Vapautuksessa tapahtui virhe');
    }
  };
  
  const handleReserveWasher = async (pesukone_id) => {
    // if (!rekisterinumero.trim()) {
    //   alert('Syötä rekisterinumero');
    //   return;
    // }
    try {
      const response = await axios.post('http://localhost:3001/api/reserve-washer', {
        pesukone_id
      });
      if (response.status === 200) {
        alert('Pesukone varattu onnistuneesti!');
        fetchData(); // Päivitetään tiedot
      }
    } catch (error) {
      console.error('Virhe pesukoneen varauksessa:', error);
      alert('Pesukoneessa tapahtui virhe');
    }
};

const handleReleaseWasher = async (pesukone_id) => {
  try {
    const response = await axios.put('http://localhost:3001/api/release-washer', {
       pesukone_id 
      });
    if (response.status === 200) {
      alert('Pesukone vapautettu onnistuneesti!');
      fetchData(); // Päivitetään tiedot
    }
  } catch (error) {
    console.error('Virhe pesukoneen vapautuksessa:', error);
    alert('Pesukoneessa tapahtui virhe');
  }
};


// const handleAddParking = async () => {
//   if (!newParkingName.trim()) {
//     alert('Syötä autopaikan nimi');
//     return;
//   }
//   try {
//     const response = await axios.post('http://localhost:3001/api/add-parking', {
//       nimi: newParkingName,
//     });
//     if (response.status === 201) {
//       alert('Uusi autopaikka lisätty onnistuneesti!');
//       setNewParkingName(''); // Tyhjennetään syötekenttä
//       fetchData(); // Päivitetään autopaikkojen lista
//     }
//   } catch (error) {
//     console.error('Virhe autopaikan lisäämisessä:', error);
//     alert('Autopaikan lisäämisessä tapahtui virhe');
//   }
// };





  // Funktio napin värin vaihtamiseen
  const toggleColor = (index, type) => {
    if (type === 'car') {
    setButtons(
      buttons.map((button, i) =>
        i === index ? { ...button, isGreen: !button.isGreen } : button
      )
    );
  } else if (type === 'washer') {
    setWashers(
      washers.map((button, i) =>
        i === index ? { ...button, isGreen: !button.isGreen } : button
      )
    );
  } else if (type === 'dryer') {
    setDryers(
      dryers.map((button, i) =>
        i === index ? { ...button, isGreen: !button.isGreen } : button
      )
    )
  }else if (type === 'dryingRoom') {
    setDryingRoomSections(
      dryingRoomSections.map((section, i) =>
        i === index ? { ...section, isGreen: !section.isGreen } : section
      )
    );
  }
};

  return (

    // <Router>
    // <div>
    //   <nav>
    //     {/* Väliaikainen linkki admin-sivulle */}
    //     <Link to="/admin">Siirry admin-sivulle</Link>
    //   </nav>

    //   <Routes>
    //     <Route path="/" element={<h2>Tervetuloa käyttäjän sivulle!</h2>} />
    //     <Route path="/admin" element={<AppAdmin />} />
    //   </Routes>
    
    
    <div className='app-container'>

{/* <h2>Lisää uusi autopaikka</h2>
      <input
        type="text"
        placeholder="Syötä autopaikan nimi"
        value={newParkingName}
        onChange={(e) => setNewParkingName(e.target.value)}
      />
      <button onClick={handleAddParking}>Lisää autopaikka</button> */}

      <section>
        <h2>Autopaikat</h2>
        <input
         type="text"
         placeholder="Syötä rekisterinumero"
         value={rekisterinumero}
         onChange={(e) => setRekisterinumero(e.target.value)}
          />
          <div className='parking-container'>
          {parkingSpots.map((spot) => (
          <div key={`parking-${spot.paikka_id}`} className={`parking-spot ${spot.on_varattu ? 'varattu' : 'vapaa'}`}>
            <h3>{spot.nimi}</h3>
            <p>{spot.on_varattu ? `Varattu: ${spot.rekisterinumero}` : 'Vapaa'}</p>
            {spot.on_varattu ? (
              <button onClick={() => handleRelease(spot.paikka_id)}>Vapauta</button>
            ) : (
              <button onClick={() => handleReserve(spot.paikka_id)}>Varaa</button>
            )}
          </div>
            ))}
          </div>
      </section>

      {/* <h1>Autopaikat</h1>
      <div className='button-container'>
        {buttons.map((button, index) => (
          <button key={index}
          onClick={() => toggleColor(index, 'car')} 
          className={`main-button ${button.isGreen ? 'green' : 'red'}`}>
              {button.nimi}
            </button>
        ))}
          </div> */}
        
        <section>
  <h2>Pesukoneet</h2>
  <div className='washer-container'>
    {washers.map((washer) => (
      <div key={`washer-${washer.pesukone_id}`} className={`washer ${washer.on_varattu ? 'varattu' : 'vapaa'}`}>
        <h3>{washer.nimi}</h3>
        <p>{washer.on_varattu ? `Varattu: ${washer.varaajan_nimi}` : 'Vapaa'}</p>
        {washer.on_varattu ? (
          <button onClick={() => handleReleaseWasher(washer.pesukone_id)}>Vapauta</button>
        ) : (
          <button onClick={() => handleReserveWasher(washer.pesukone_id)}>Varaa</button>
        )}
      </div>
    ))}
  </div>
</section>

      <h1>Kuivausrummut</h1>
      <div className='button-container'>
        {dryers.map((dryer, index) => (
          <button 
          key={index} 
          onClick={() => toggleColor(index, 'dryer')}
          className={`main-button ${dryer.isGreen ? 'green' : 'red'}`}
          >
            {dryer.nimi}
          </button>
        ))}
      </div>

      <h1>Kuivaushuone</h1>
      <div className='button-container'>
        {dryingRoomSections.map((section, index) => (
          <button 
          key={index} 
            onClick={() => toggleColor(index, 'dryingRoom')}
            className={`main-button ${section.isGreen ? 'green' : 'red'}`}
            >
              {section.kuivaushuone_osa}
            </button>
          
        ))}
      </div>
    </div>
    // </div>
    // </Router>
  );
  
}

export default App;