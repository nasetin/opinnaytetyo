import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [userProfile, setUserProfile] = useState(null);
    const [parkingSpots, setParkingSpots] = useState([]);
    const [washers, setWashers] = useState([]);
    const [dryers, setDryers] = useState([]);
    const [dryingRoomSections, setDryingRoomSections] = useState([]);
    const [rekisterinumero, setRekisterinumero] = useState('');
    const [saunaVuorot, setSaunaVuorot] = useState([]);

    
    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/complete-data');
            setParkingSpots(response.data.parkingSpots);
            setWashers(response.data.washers);
            setDryers(response.data.dryers);
            setDryingRoomSections(response.data.dryingRoomSections);
            setSaunaVuorot(response.data.saunaVuorot);
            
        } catch (error) {
            console.error('Virhe tietojen haussa:', error);
            // Jos virhe on 401 tai 403, voidaan ohjata takaisin kirjautumissivulle
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                window.location.href = '/login';
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Ei tokenia -> ohjataan kirjautumissivulle
            window.location.href = '/login';
            return;
        }

        // Asetetaan axiosin Authorization-otsikko
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Käyttäjäntiedot
        axios.get('http://localhost:3001/api/user-profile')
        .then(res => setUserProfile(res.data))
        .catch(err => console.error(err));

        fetchData();
    }, []);

    const handleReserve = async (type, id) => {
        let payload;

        if (type === 'parking') {
            if (!rekisterinumero.trim()) {
                alert('Syötä rekisterinumero');
                return;
            }
            payload = { paikka_id: id, rekisterinumero };
        } else if (type === 'washer') {
            payload = { pesukone_id: id }; 
        } else if (type === 'dryer') {
            payload = { kuivausrumpu_id: id }; 
        } else if (type === 'drying-room') {
            payload = { huoneenosio_id: id }; 
        } else if (type === 'sauna') {
            payload = { varaus_id: id };
        }

        console.log('Lähetettävä data:', { type, payload }); // Debug

        try {
            await axios.post(`http://localhost:3001/api/reserve-${type}`, payload);
            alert('Varattu onnistuneesti.');
            fetchData();
        } catch (error) {
            console.error('Virhe varauksessa:', error);
            alert('Varaus epäonnistui.');
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                // Token vanhentunut tai virheellinen -> takaisin kirjautumissivulle
                window.location.href = '/login';
            }
        }
    };

    return (
            <div className="container">
        <div>
            {userProfile && <p>Tervetuloa, {userProfile.nimi}!</p>}
            <button onClick={handleLogout}>Kirjaudu ulos</button>
            </div>

            <h1>Varaukset</h1>
            <input
                type="text"
                placeholder="Syötä rekisterinumero"
                value={rekisterinumero}
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

            <h2>Saunavuorot</h2>
                <div className="items-container">
                    {saunaVuorot.map((vuoro) => (
                        <div key={vuoro.varaus_id} className={`item ${vuoro.on_varattu ? 'reserved' : 'available'}`}>
                            <p>{vuoro.päivä} klo {vuoro.kellonaika}</p>
                            {vuoro.on_varattu
                                ? <p>Varattu</p>
                                : <button onClick={() => handleReserve('sauna', vuoro.varaus_id)}>Varaa</button>}
                        </div>
                    ))}
                </div>


            </div>

    );
}

export default App;
