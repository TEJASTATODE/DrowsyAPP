import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      
        map.flyTo([lat, lng], map.getZoom(), { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};

const createRadarIcon = (isDrowsy) => {
    const colorClass = isDrowsy ? "bg-red-500 shadow-red-500" : "bg-blue-500 shadow-blue-500";
    return L.divIcon({
      className: "custom-radar-icon",
      html: `
        <div class="relative flex items-center justify-center w-6 h-6">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorClass}"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white ${colorClass}"></span>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
};

const DrowsyMap = ({ lat, lng, isDrowsy }) => {
  return (

    <MapContainer 
        center={[lat, lng]} 
        zoom={16} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", background: "#0f172a" }}
    >
        // src/components/DrowsyMap.jsx

<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
/>
        
        <Marker position={[lat, lng]} icon={createRadarIcon(isDrowsy)}>
            <Popup className="custom-popup">
                <div className="text-slate-900 font-semibold text-center">
                    Vehicle Location <br /> 
                    <span className={`font-bold ${isDrowsy ? "text-red-600" : "text-green-600"}`}>
                        {isDrowsy ? "⚠️ DROWSY" : "✅ ACTIVE"}
                    </span>
                </div>
            </Popup>
        </Marker>

        <RecenterMap lat={lat} lng={lng} />
    </MapContainer>
  );
};

export default DrowsyMap;