import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Home from './components/home/Home';
import Map from './components/map/Map';

const App = () => {
  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyAxMst2ofWb1PLfmLH050Aee0HsyjiGibE">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </LoadScript>
    </div>
  );
};

export default App;



