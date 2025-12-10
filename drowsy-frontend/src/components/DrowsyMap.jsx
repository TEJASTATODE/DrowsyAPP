import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


const RecenterAutomatically = ({ lat, lng, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {

      map.flyTo([lat, lng], zoom || map.getZoom(), {
        animate: true,
        duration: 1.5 
      });
    }
  }, [lat, lng, zoom, map]);

  return null;
};

const createRadarIcon = (isDrowsy) => {
    return L.divIcon({
      className: "custom-radar-icon",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${isDrowsy ? 'bg-red-500' : 'bg-blue-500'}"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white ${isDrowsy ? 'bg-red-600' : 'bg-blue-600'}"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
};

const DrowsyMap = ({ lat, lng, isDrowsy, zoom = 15 }) => {

  const isValidCoord = lat !== undefined && lng !== undefined && lat !== 0;

  if (!isValidCoord) {
     return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-medium">
           Waiting for GPS...
        </div>
     );
  }

  return (
    <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false} 
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[lat, lng]} icon={createRadarIcon(isDrowsy)}>
            <Popup className="custom-popup" closeButton={false} autoPan={false}>
                <div className="text-slate-900 font-bold text-xs text-center">
                    {isDrowsy ? "⚠️ ALERT" : "Vehicle Active"}
                </div>
            </Popup>
        </Marker>

        <RecenterAutomatically lat={lat} lng={lng} zoom={zoom} />
        
    </MapContainer>
  );
};

export default DrowsyMap;