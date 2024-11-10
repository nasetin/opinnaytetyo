import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [buttons, setButtons] = useState([]);
  const [washers, setWashers] = useState([]);
  const [dryers, setDryers] = useState([]);
  const [dryingRoomSections, setDryingRoomSections] = useState([]);

  // useEffect(() => {
  //   fetch('http://localhost:3001/api/parking-spots')
  //     .then(response => response.json())
  //     .then(data => setButtons(data))
  //     .catch(error => console.error('Error fetching parking spots:', error));
  // }, []);
  
  // useEffect(() => {
  //   fetch('http://localhost:3001/api/washers')  
  //     .then(response => response.json())
  //     .then(data => setWashers(data))
  //     .catch(error => console.error('Error fetching washers:', error));
  // }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/complete-data')
      .then(response => response.json())
      .then(data => {
        setButtons(data.parkingSpots);
        setWashers(data.washers);
        setDryers(data.dryers);
        setDryingRoomSections(data.dryingRoomSections);
      })
      .catch(error => console.error('Error fetching parking spots and washers:', error));
  }, []);
  
 
  

  // const [dryers, setDryers] = useState([
  //   { label: 'Kuivausrumpu 1', isGreen: true },
  //   { label: 'Kuivausrumpu 2', isGreen: true },
  //   { label: 'Kuivausrumpu 3', isGreen: true },
  // ]);

  // const [dryingRoomSections, setDryingRoomSections] = useState([
  //   { label: 'Kuivaushuone Osio 1', isGreen: true },
  //   { label: 'Kuivaushuone Osio 2', isGreen: true },
  // ]);
  

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
    <div className='app-container'>
      <h1>Autopaikat</h1>
      <div className='button-container'>
        {buttons.map((button, index) => (
          <button key={index}
          onClick={() => toggleColor(index, 'car')} 
          className={`main-button ${button.isGreen ? 'green' : 'red'}`}>
              {button.nimi}
            </button>
        ))}
          </div>
        
      <h1>Pesukoneet</h1>
      <div className='button-container'>
        {washers.map((washer, index) => (
          <button key={index} 
            onClick={() => toggleColor(index, 'washer')}
            className={`main-button ${washer.isGreen ? 'green' : 'red'}`}>
              {washer.nimi}
          </button>
        ))}
      </div>

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
  );
}

export default App;