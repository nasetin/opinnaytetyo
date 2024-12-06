import React, { useState } from 'react';
import axios from 'axios';

function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [salasana, setSalasana] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, salasana});
            const { token } = response.data;

            localStorage.setItem('token', token);
            onLogin();
        } catch (error) {
            alert('Kirjautuminen epäonnistui');
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