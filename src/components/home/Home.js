import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../map/Map';
import Logo from '../../images/logo_brickbro.png'

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
          )}&key=AIzaSyAxMst2ofWb1PLfmLH050Aee0HsyjiGibE` // Reemplaza con tu clave de API de Google Maps
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={Logo} alt="Logo" style={{ width: '300px', height: '100px', padding: '40px', marginBottom: '15px' }} />
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Introduce una dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ marginRight: '15px', padding: '10px', fontSize: '15px', width: '320px' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px', fontSize: '15px', width: '100px' }}>
          Search
        </button>
      </div>

      {searchSuccess && <Map key={mapKey} searches={searches} />}
    </div>
  );
};

export default Home;



























