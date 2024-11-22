import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './appAdmin.css';

function AppAdmin() {
  const [carSpaces, setCarSpaces] = useState([]);
  const [washers, setWashers] = useState([]);
  const [dryers, setDryers] = useState([]);
  const [dryingRoom, setDryingRoom] = useState([]);
  const [saunaDays, setSaunaDays] = useState([]);
  const [hasDryingRoom, setHasDryingRoom] = useState(false);
  const [hasSauna, setHasSauna] = useState(false);

  // Funktiot nappien luomiseen eri kategorioille
  const addButton = (type) => {
    if (type === 'car') {
      setCarSpaces([...carSpaces, { label: `Autopaikka ${carSpaces.length + 1}`, isGreen: true }]);
    } else if (type === 'washer') {
      setWashers([...washers, { label: `Pesukone ${washers.length + 1}`, isGreen: true }]);
    } else if (type === 'dryer') {
      setDryers([...dryers, { label: `Kuivausrumpu ${dryers.length + 1}`, isGreen: true }]);
    }
  };

  const addDryingRoom = () => {
    setHasDryingRoom(true);
    setDryingRoom([]);
  };

  const addDryingRoomSection = () => {
    setDryingRoom([...dryingRoom, { label: `Kuivaushuone osio ${dryingRoom.length + 1}`, isGreen: true }]);
  };

  const addSauna = () => {
    setHasSauna(true);
    setSaunaDays([]);
  };

  const toggleSaunaDay = (day) => {
    if (saunaDays.includes(day)) {
      setSaunaDays(saunaDays.filter(d => d !== day));
    } else {
      setSaunaDays([...saunaDays, day]);
    }
  };

  const toggleColor = (index, type) => {
    if (type === 'car') {
      setCarSpaces(
        carSpaces.map((button, i) =>
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
      );
    } else if (type === 'dryingRoom') {
      setDryingRoom(
        dryingRoom.map((section, i) =>
          i === index ? { ...section, isGreen: !section.isGreen } : section
        )
      );
    }
  };

  const removeButton = (index, type) => {
    if (type === 'car') {
      setCarSpaces(carSpaces.filter((_, i) => i !== index));
    } else if (type === 'washer') {
      setWashers(washers.filter((_, i) => i !== index));
    } else if (type === 'dryer') {
      setDryers(dryers.filter((_, i) => i !== index));
    } else if (type === 'dryingRoom') {
      setDryingRoom(dryingRoom.filter((_, i) => i !== index));
    }
  };

  const removeDryingRoom = () => {
    setDryingRoom([]);
    setHasDryingRoom(false);
  };

  const removeSauna = () => {
    setSaunaDays([]);
    setHasSauna(false);
  };

  // Tallennusfunktio, joka lähettää tiedot palvelimelle
  const saveData = () => {
    const data = {
      carSpaces,
      washers,
      dryers,
      dryingRoom,
      saunaDays,
      hasDryingRoom,
      hasSauna,
    };

    // Lähetetään data palvelimelle
    fetch('http://localhost:3001/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          alert('Tiedot tallennettu onnistuneesti!');
        } else {
          alert('Tallennus epäonnistui.');
        }
      })
      .catch((error) => {
        console.error('Virhe tallennuksessa:', error);
        alert('Virhe tallennuksessa.');
      });
  };

  return (
    <div className="app-container">
            <div>
            <Link to="/">
            <button>Takaisin käyttäjäsivulle</button>
          </Link>
        </div>

      <h1>Luo kiinteistön varattavat palvelut!</h1>
      <p>Lisää kiinteistölle kuivaushuone, sauna ja haluamasi määrä autopaikkoja ja pesutuvan laitteita.</p>

      <div className="button-group">
        <button onClick={() => addButton('car')}>Lisää autopaikka</button>
        <button onClick={() => addButton('washer')}>Lisää pesukone</button>
        <button onClick={() => addButton('dryer')}>Lisää kuivausrumpu</button>
        {!hasDryingRoom && (
          <button onClick={addDryingRoom}>Lisää kuivaushuone</button>
        )}
        {hasDryingRoom && (
          <button onClick={addDryingRoomSection}>Lisää kuivaushuoneen osio</button>
        )}
        {!hasSauna && (
          <button onClick={addSauna}>Lisää sauna</button>
        )}
        <button onClick={saveData}>Tallenna</button>
      </div>

      {/* Kaikki muut komponentit pysyvät ennallaan */}
    </div>
  );
}

export default AppAdmin;

           