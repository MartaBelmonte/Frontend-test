import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const Map = ({ googleMapsApiKey, key, searches }) => {
  const location = useLocation();
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  let marker = null; // Mover la declaración del marcador fuera del useEffect

  useEffect(() => {
    const mapElement = document.getElementById('map');

    if (mapElement && window.google) {
      const { google } = window;

      const { search } = location;
      const params = new URLSearchParams(search);
      const lat = parseFloat(params.get('lat')) || 0;
      const lng = parseFloat(params.get('lng')) || 0;
      const address = params.get('address');

      if (!isNaN(lat) && !isNaN(lng) && address) {
        setAddress(address);
        setSearchHistory((prevHistory) => [...prevHistory, address]);
      }

      if (!mapElement.dataset.mapInitialized) {
        const newMap = new google.maps.Map(mapElement, {
          center: { lat, lng },
          zoom: 8,
        });

        setMap(newMap);

        // Crear el marcador una vez cuando se inicializa el mapa
        marker = new google.maps.Marker({
          map: newMap,
          position: { lat, lng },
        });

        mapElement.dataset.mapInitialized = 'true';
      }
    }
  }, [location, map, googleMapsApiKey]);

  const handleSearch = async () => {
    if (address.trim() !== '') {
      await performMapSearch(address);
      setSearchHistory((prevHistory) => [...prevHistory, address]);
    }
  };

  const performMapSearch = async (searchAddress) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchAddress
        )}&key=${googleMapsApiKey}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.results.length > 0) {
          const location = data.results[0].geometry.location;

          if (map) {
            map.setCenter(location);
            map.setZoom(8);

            if (marker) {
              marker.setMap(null);
            }

            marker = new window.google.maps.Marker({
              map: map,
              position: location,
            });
          }
        } else {
          console.error('No se encontró información de ubicación para la dirección proporcionada.');
        }
      } else {
        console.error('Error al obtener datos:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setAddress(e.target.value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      performMapSearch(e.target.value);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  return (
    <div>
      <h1>Mapa</h1>
      <div>
        <input
          type="text"
          placeholder="Introduce una dirección"
          value={address}
          onChange={handleChange}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
      <div id="map" style={{ height: '400px', width: '400px' }}>
        <GoogleMap
          key={key}
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={{ lat: 0, lng: 0 }}
          zoom={8}
        ></GoogleMap>
      </div>
      <h2>Búsquedas realizadas en esta sesión:</h2>
      <ul>
        {searchHistory.map((search, index) => (
          <li key={index}>{search}</li>
        ))}
      </ul>
    </div>
  );
};

export default Map;

