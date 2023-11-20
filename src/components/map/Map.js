/* global google */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const Map = ({ googleMapsApiKey }) => {
  const location = useLocation();
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState('');
  const [searchHistory, setSearchHistory] = useState(new Set()); // Usar un conjunto en lugar de un array
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  const mapInitializedRef = useRef(false);

  useEffect(() => {
    const mapElement = document.getElementById('map');

    if (mapElement && window.google) {
      const { google } = window;
      const { search } = location;
      const params = new URLSearchParams(search);
      const lat = parseFloat(params.get('lat')) || 0;
      const lng = parseFloat(params.get('lng')) || 0;
      const currentAddress = params.get('address');

      if (!isNaN(lat) && !isNaN(lng) && currentAddress) {
        setAddress(currentAddress);
        setSearchHistory((prevHistory) => new Set(prevHistory).add(currentAddress)); // Añadir al conjunto
      }

      let newMap = map;

      if (!map) {
        newMap = new google.maps.Map(mapElement, {
          center: { lat, lng },
          zoom: 8,
        });

        setMap(newMap);
      } else {
        newMap.panTo({ lat, lng });
        newMap.setZoom(8);
      }

      setInfoWindow(new google.maps.InfoWindow({ maxWidth: 350 }));
    }
  }, [location, googleMapsApiKey, map]);

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  const addMarker = (location) => {
    const { google } = window;

    const newMarker = new google.maps.Marker({
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue.png',
      map: map,
      position: { lat: location.lat, lng: location.lng },
      title: location.name,
      animation: google.maps.Animation.DROP,
    });

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    google.maps.event.addListener(newMarker, 'click', function () {
      const content = `<div><h3>${location.name}</h3><p>${location.address}<br><a href="${location.url}">Get Directions</a></p></div>`;
      infoWindow.setContent(content);
      infoWindow.open(map, newMarker);
    });
  };

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [markers, map]);

  const handleSearch = async () => {
    if (address.trim() !== '') {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          const location = results[0].geometry.location;
          const newLocation = {
            name: 'New Location',
            address,
            lat: location.lat(),
            lng: location.lng(),
            url: `https://goo.gl/maps/${location.lat()},${location.lng()}`,
          };

          addMarker(newLocation);
        } else {
          console.error(`Geocode of ${address} failed: ${status}`);
        }
      });

      setSearchHistory((prevHistory) => new Set(prevHistory).add(address)); // Añadir al conjunto
    }
  };

  const handleChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
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
          mapContainerStyle={{ height: '100%', width: '400px' }}
          center={{ lat: 0, lng: 0 }}
          zoom={8}
        ></GoogleMap>
      </div>
      <h2>Búsquedas realizadas en esta sesión:</h2>
      <ul>
        {[...searchHistory].map((search, index) => (
          <li key={index}>{search}</li>
        ))}
      </ul>
    </div>
  );
};

export default Map;















