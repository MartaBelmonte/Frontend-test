import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../map/Map';

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
    <div>
      <h1>Geolocalizador de Direcciones</h1>
      <input
        type="text"
        placeholder="Introduce una dirección"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>

      {searchSuccess && <Map key={mapKey} searches={searches} />}
    </div>
  );
};

export default Home;



























