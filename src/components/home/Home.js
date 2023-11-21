import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../map/Map';
import Logo from '../../images/logo_brickbro.png'; 
import '../../styles/App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const [address, setAddress] = useState('');
  const [searches, setSearches] = useState([]);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (address.trim() !== '') {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=AIzaSyAxMst2ofWb1PLfmLH050Aee0HsyjiGibE`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.results.length > 0) {
            const location = data.results[0].geometry.location;
            setSearchSuccess(true);
            setSearches([...searches, address]);
            setMapKey((prevKey) => prevKey + 1);
            navigate(`/map?lat=${location.lat}&lng=${location.lng}&address=${encodeURIComponent(address)}`);
          } else {
            console.error('No se encontró información de ubicación para la dirección proporcionada.');
            alert('No se encontró información de ubicación para la dirección proporcionada.');
          }
        } else {
          console.error('Error al obtener datos:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="home-container">
      <img src={Logo} alt="Logo" className="logo-home" />
      <div className="search-container-home">
        <FontAwesomeIcon icon={faSearch} className="search-icon-home" /> 
        <input 
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="address-input" 
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      {searchSuccess && <Map key={mapKey} searches={searches} />}
    </div>
  );
};

export default Home;




























