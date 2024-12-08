import React, { useState } from 'react';
import axios from 'axios';

function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [salasana, setSalasana] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, salasana });
            // Tarkista, palauttaako response data.token -arvon
            console.log('Login response:', response);
          
            if (response.status === 200 && response.data.token) {
              // Onnistunut kirjautuminen
              localStorage.setItem('token', response.data.token);
              window.location.href = '/varaus'; // Ohjataan varaus-sivulle
            } else {
              alert('Kirjautuminen epäonnistui.');
            }
          } catch (error) {
            console.error('Virhe kirjautumisessa:', error);
            alert('Kirjautuminen epäonnistui.');
          }
    };

    return (
        <div>
            <h2>Kirjaudu sisään</h2>
            <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Salasana" value={salasana} onChange={(e) => setSalasana(e.target.value)} />
            <button onClick={handleLogin}>Kirjaudu</button>
        </div>
    );
}

export default LoginPage;