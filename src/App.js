import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import Home from './components/home/Home';
import Map from './components/map/Map';

const App = () => {
  return (
    <div>
      <LoadScript googleMapsApiKey="AIzaSyD57oAoC-On2NYZjQwvzH4qdtXYytopwL0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
        </Routes>
      </LoadScript>
    </div>
  );
};

export default App;



