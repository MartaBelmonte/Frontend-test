/* global google */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import Logo from '../../images/logo_brickbro.png'

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <img src={Logo} alt="Logo" style={{ width: '200px', height: '80px', padding: '40px', marginBottom: '15px', alignSelf: 'flex-start' }} />
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={handleChange}
          style={{ marginRight: '15px', padding: '10px', fontSize: '15px', width: '320px', backgroundColor: 'lightgray', }}
        />
        <button onClick={handleSearch} style={{ padding: '8px', fontSize: '15px', width: '130px' }}>
          Search
        </button>
      </div>
      <div id="map" style={{ width: '530px', height: '400px', border: '2px solid black' }}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={{ lat: 0, lng: 0 }}
          zoom={8}
        ></GoogleMap>
      </div>
      <div style={{ margin: '20px', border: '2px solid grey', padding: '10px', width: '520px', textAlign: 'left', marginLeft: '10px' }}>
        <h2 style={{ color: 'gray', fontSize: '14px', marginLeft: '9px' }}>Búsquedas</h2>
        <ul style={{ marginLeft: '10px', listStyle: 'none', marginLeft: '-30px' }}>
          {[...searchHistory].map((search, index) => (
            <li key={index} style={{marginBottom: '8px', fontSize: '14px'}}>{search}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Map;















