import React, { useState } from 'react';
import './App.css';

function App() {
  const [buttons, setButtons] = useState([
    { label: 'Autopaikka 1', isGreen: true },
    { label: 'Autopaikka 2', isGreen: true },
    { label: 'Autopaikka 3', isGreen: true },
  ]);

  const [washers, setWashers] = useState([
    { label: 'Pesukone 1', isGreen: true },
    { label: 'Pesukone 2', isGreen: true },
    { label: 'Pesukone 3', isGreen: true },
    
  ]);

  const [dryers, setDryers] = useState([
    { label: 'Kuivausrumpu 1', isGreen: true },
    { label: 'Kuivausrumpu 2', isGreen: true },
    { label: 'Kuivausrumpu 3', isGreen: true },
  ]);

  const [dryingRoomSections, setDryingRoomSections] = useState([
    { label: 'Kuivaushuone Osio 1', isGreen: true },
    { label: 'Kuivaushuone Osio 2', isGreen: true },
  ]);
  

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
          <div key={index} className='button-wrapper'>
            <button
              onClick={() => toggleColor(index)}
              className={`main-button ${button.isGreen ? 'green' : 'red'}`}
            >
              {button.label}
            </button>
          </div>
        ))}
      </div>
      <h1>Pesukoneet</h1>
      <div className='button-container'>
        {washers.map((button, index) => (
          <div key={index} className='button-wrapper'>
            <button
            onClick={() => toggleColor(index, 'washer')}
            className={`main-button ${button.isGreen ? 'green' : 'red'}`}
            >
              {button.label}
            </button>
          </div>
        ))}
      </div>
      <h1>Kuivausrummut</h1>
      <div className='button-container'>
        {dryers.map((button, index) => (
          <div key={index} className='button-wrapper'>
            <button
            onClick={() => toggleColor(index, 'dryer')}
            className={`main-button ${button.isGreen ? 'green' : 'red'}`}
            >
              {button.label}
            </button>
          </div>
        ))}
      </div>
      <h1>Kuivaushuone</h1>
      <div className='button-container'>
        {dryingRoomSections.map((section, index) => (
          <div key={index} className='button-wrapper'>
            <button
              onClick={() => toggleColor(index, 'dryingRoom')}
              className={`main-button ${section.isGreen ? 'green' : 'red'}`}
            >
              {section.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;