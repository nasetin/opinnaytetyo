import React, { useState } from 'react';
import './AppAdmin.css';

function AppAdmin() {
  const [carSpaces, setCarSpaces] = useState([]);
  const [washers, setWashers] = useState([]);
  const [dryers, setDryers] = useState([]);
  const [dryingRoom, setDryingRoom] = useState([]);
  const [saunaDays, setSaunaDays] = useState([]);
  const [hasDryingRoom, setHasDryingRoom] = useState(false);
  const [hasSauna, setHasSauna] = useState(false);

  // UUSI: saunaTimes-tuki
  const [saunaTimes, setSaunaTimes] = useState([]);
  const allDays = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai', 'Lauantai', 'Sunnuntai'];

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
    setSaunaTimes([]); // Tyhjennetään saunaTimes alussa
  };

  const toggleSaunaDay = (day) => {
    if (saunaDays.includes(day)) {
      setSaunaDays(saunaDays.filter(d => d !== day));
    } else {
      setSaunaDays([...saunaDays, day]);
    }
  };

  // Uudet funktiot saunaTimesille
  const addSaunaDay = (day) => {
    if (!saunaTimes.find(d => d.day === day)) {
      setSaunaTimes([...saunaTimes, { day, times: [] }]);
    }
  };

  const removeSaunaDay = (day) => {
    setSaunaTimes(saunaTimes.filter(d => d.day !== day));
  };

  const addSaunaTime = (day, time) => {
    setSaunaTimes(saunaTimes.map(d => {
      if (d.day === day) {
        return { ...d, times: [...d.times, time] };
      }
      return d;
    }));
  };

  const removeSaunaTime = (day, time) => {
    setSaunaTimes(saunaTimes.map(d => {
      if (d.day === day) {
        return { ...d, times: d.times.filter(t => t !== time) };
      }
      return d;
    }));
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
    setSaunaTimes([]);
    setHasSauna(false);
  };

  const saveData = () => {
    const data = {
      carSpaces,
      washers,
      dryers,
      dryingRoom,
      saunaDays,
      hasDryingRoom,
      hasSauna,
      saunaTimes // Lähetetään saunaTimes datana backendille
    };
  
    fetch('http://localhost:3001/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          alert('Tiedot tallennettu onnistuneesti!');
        } else {
          alert('Tallennus epäonnistui.');
        }
      })
      .catch(error => {
        console.error('Virhe tallennuksessa:', error);
        alert('Virhe tallennuksessa.');
      });
  };

  return (
    <div className="app-container">
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
      </div>

      <div className="button-section">
        <h2>Autopaikat</h2>
        <div className="button-list">
          {carSpaces.map((button, index) => (
            <div key={index} className="button-item">
              <button
                onClick={() => toggleColor(index, 'car')}
                className={button.isGreen ? 'green' : 'red'}
              >
                {button.label}
              </button>
              <button className="remove-button" onClick={() => removeButton(index, 'car')}>
                Poista
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="button-section">
        <h2>Pesukoneet</h2>
        <div className="button-list">
          {washers.map((button, index) => (
            <div key={index} className="button-item">
              <button
                onClick={() => toggleColor(index, 'washer')}
                className={button.isGreen ? 'green' : 'red'}
              >
                {button.label}
              </button>
              <button className="remove-button" onClick={() => removeButton(index, 'washer')}>
                Poista
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="button-section">
        <h2>Kuivausrummut</h2>
        <div className="button-list">
          {dryers.map((button, index) => (
            <div key={index} className="button-item">
              <button
                onClick={() => toggleColor(index, 'dryer')}
                className={button.isGreen ? 'green' : 'red'}
              >
                {button.label}
              </button>
              <button className="remove-button" onClick={() => removeButton(index, 'dryer')}>
                Poista
              </button>
            </div>
          ))}
        </div>
      </div>

      {hasDryingRoom && (
        <div className="button-section">
          <h2>Kuivaushuone</h2>
          <button onClick={removeDryingRoom} className="remove-drying-room">
            Poista kuivaushuone
          </button>
          <div className="button-list">
            {dryingRoom.map((section, index) => (
              <div key={index} className="button-item">
                <button
                  onClick={() => toggleColor(index, 'dryingRoom')}
                  className={section.isGreen ? 'green' : 'red'}
                >
                  {section.label}
                </button>
                <button
                  className="remove-button"
                  onClick={() => removeButton(index, 'dryingRoom')}
                >
                  Poista osio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSauna && (
        <div className="button-section">
          <h2>Sauna</h2>
          <button onClick={removeSauna} className="remove-sauna">
            Poista sauna
          </button>
          <p>Valitse päivät ja lisää aikoja:</p>
          {allDays.map((day) => {
            const dayObj = saunaTimes.find(d => d.day === day);
            return (
              <div key={day} style={{marginBottom:'15px'}}>
                <strong>{day}</strong><br />
                {!dayObj ? (
                  <button onClick={() => addSaunaDay(day)}>Lisää tämä päivä</button>
                ) : (
                  <div>
                    <button onClick={() => removeSaunaDay(day)}>Poista tämä päivä</button>
                    <div style={{marginTop:'5px'}}>
                      <input type="time" id={`time-${day}`} />
                      <button onClick={() => {
                        const timeInput = document.getElementById(`time-${day}`);
                        const timeValue = timeInput.value;
                        if (timeValue) addSaunaTime(day, timeValue);
                      }}>Lisää aika</button>
                    </div>
                    <div style={{marginTop:'5px'}}>
                      {dayObj.times.map(t => (
                        <span key={t} style={{marginRight:'10px'}}>
                          {t} <button onClick={() => removeSaunaTime(day, t)}>X</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button onClick={saveData}>Tallenna</button>
    </div>
  );
}

export default AppAdmin;
