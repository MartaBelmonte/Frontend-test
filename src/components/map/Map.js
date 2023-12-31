/* global google */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */

import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import Logo from '../../images/logo_brickbro.png';
import '../../styles/App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Map = ({ googleMapsApiKey }) => {
  // Obtener la ubicación actual de la ruta
  const location = useLocation();
  
  // Estados para gestionar la información del mapa
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState('');
  const [searchHistory, setSearchHistory] = useState(new Set()); 
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null);

  // Utilizado para verificar si el mapa ya se ha inicializado
  const mapInitializedRef = useRef(false);

  useEffect(() => {
    // Obtener el elemento del mapa por su ID
    const mapElement = document.getElementById('map');

    // Verificar si el elemento del mapa y la API de Google están disponibles
    if (mapElement && window.google) {
      const { google } = window;
      const { search } = location;
      const params = new URLSearchParams(search);
      const lat = parseFloat(params.get('lat')) || 0;
      const lng = parseFloat(params.get('lng')) || 0;
      const currentAddress = params.get('address');

      // Verificar si hay coordenadas y dirección en la URL
      if (!isNaN(lat) && !isNaN(lng) && currentAddress) {
        setAddress(currentAddress);
        setSearchHistory((prevHistory) => new Set(prevHistory).add(currentAddress));
      }

      let newMap = map;

      // Crear un nuevo mapa si no existe, de lo contrario, centrarlo en las coordenadas dadas
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

      // Inicializar la ventana de información del marcador
      setInfoWindow(new google.maps.InfoWindow({ maxWidth: 350 }));
    }
  }, [location, googleMapsApiKey, map]);

  // Limpiar los marcadores en el mapa
  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  // Agregar un marcador al mapa
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

    // Agregar un evento de clic al marcador para mostrar la información
    google.maps.event.addListener(newMarker, 'click', function () {
      const content = `<div><h3>${location.name}</h3><p>${location.address}<br><a href="${location.url}">Get Directions</a></p></div>`;
      infoWindow.setContent(content);
      infoWindow.open(map, newMarker);
    });
  };

  // Ajustar el zoom del mapa para incluir todos los marcadores
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((marker) => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [markers, map]);

  // búsqueda de direcciones
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

      setSearchHistory((prevHistory) => new Set(prevHistory).add(address));
    }
  };

  // Manejar el cambio en la entrada de texto de dirección
  const handleChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
  };

  return (
    <div className="map-container">
      <img src={Logo} alt="Logo" className="logo-map" />
      <div className="search-container-map">
        <FontAwesomeIcon icon={faSearch} className="search-icon-map" />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={handleChange}
          className="address-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>
      <div id="map" className="google-map">
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={{ lat: 0, lng: 0 }}
          zoom={8}
        ></GoogleMap>
      </div>
      <div className="search-history">
        <h2>Búsquedas</h2>
        <ul>
          {[...searchHistory].map((search, index) => (
            <li key={index}>{search}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Map;















