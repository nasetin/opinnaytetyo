import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [parkingSpots, setParkingSpots] = useState([]);
    const [washers, setWashers] = useState([]);
    const [dryers, setDryers] = useState([]);
    const [dryingRoomSections, setDryingRoomSections] = useState([]);
    const [rekisterinumero, setRekisterinumero] = useState('');
    const [varaajanNimi, setVaraajanNimi] = useState('');

    // Tietojen haku backendistä
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

    // Yleinen varausfunktio
    const handleReserve = async (type, id) => {
        let payload;

        if (type === 'parking') {
          if (!rekisterinumero.trim()) {
            alert('Syötä rekisterinumero');
            return;
          }
          payload = { paikka_id: id, rekisterinumero };
        } else {
          if (!varaajanNimi.trim()) {
            alert('Syötä varaajan nimi');
            return;
          }
          payload = { [`${type}_id`]: id, varaajan_nimi: varaajanNimi };
        }

        try {
          await axios.post(`http://localhost:3001/api/reserve-${type}`, payload);
          alert(`${type} varattu onnistuneesti.`);
          fetchData();
      } catch (error) {
          console.error('Virhe varauksessa:', error);
          alert('Varaus epäonnistui.');
      }

    };

    return (
        <div className="container">
            <h1>Varaukset</h1>
            <input
                type="text"
                placeholder="Syötä rekisterinumero/varaajan nimi"
                value={rekisterinumero || varaajanNimi}
                onChange={(e) => setRekisterinumero(e.target.value)}
            />
            {/* Autopaikat */}
            <section className="section parking">
                <h2>Autopaikat</h2>
                <div className="items-container">
                    {parkingSpots.map((spot) => (
                        <div key={spot.paikka_id} className={`item ${spot.on_varattu ? 'reserved' : 'available'}`}>
                            <p>{spot.nimi}</p>
                            <button onClick={() => handleReserve('parking', spot.paikka_id)}>
                                {spot.on_varattu ? 'Varattu' : 'Varaa'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section washers">
                <h2>Pesukoneet</h2>
                <div className="items-container">
                    {washers.map((washer) => (
                        <div key={washer.pesukone_id} className={`item ${washer.on_varattu ? 'reserved' : 'available'}`}>
                            <p>{washer.nimi}</p>
                            <button onClick={() => handleReserve('washer', washer.pesukone_id)}>
                                {washer.on_varattu ? 'Varattu' : 'Varaa'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section dryers">
                <h2>Kuivausrummut</h2>
                <div className="items-container">
                    {dryers.map((dryer) => (
                        <div key={dryer.kuivausrumpu_id} className={`item ${dryer.on_varattu ? 'reserved' : 'available'}`}>
                            <p>{dryer.nimi}</p>
                            <button onClick={() => handleReserve('dryer', dryer.kuivausrumpu_id)}>
                                {dryer.on_varattu ? 'Varattu' : 'Varaa'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section drying-room">
                <h2>Kuivaushuoneet</h2>
                <div className="items-container">
                    {dryingRoomSections.map((section) => (
                        <div key={section.huoneenosio_id} className={`item ${section.on_varattu ? 'reserved' : 'available'}`}>
                            <p>{section.kuivaushuonenimi}</p>
                            <button onClick={() => handleReserve('drying-room', section.huoneenosio_id)}>
                                {section.on_varattu ? 'Varattu' : 'Varaa'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default App;
