"use client";

import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";

const containerStyle = {
  width: "100%",
  height: "75vh",
};

const center = {
  lat: -2.5,
  lng: 118,
};

const SolarPlanning: React.FC = () => {
  const [tilesVisible, setTilesVisible] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [activePage, setActivePage] = useState<"input" | "design" | "result">(
    "design"
  );
  const mapRef = useRef<google.maps.Map | null>(null);
<<<<<<< HEAD
  const [mapLoaded, setMapLoaded] = useState(false); // Tambahkan state untuk mapLoaded
=======
  const [solarPanel, setSolarPanel] = useState<google.maps.Polygon | null>(
    null
  );
>>>>>>> be13aef514557db11807d86f5c9fa7865f8ae1c6

  const toggleTiles = () => {
    if (mapRef.current && mapLoaded) {
      const xyzTiles = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          if (zoom > 10) {
            return "";
          }
          return `/images/${zoom}/${coord.x}/${coord.y}.png`;
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 10,
        minZoom: 5,
        name: "Solar HeatMap Tiles",
      });

      if (tilesVisible) {
        mapRef.current.overlayMapTypes.removeAt(0); // Remove tiles
      } else {
        mapRef.current.overlayMapTypes.insertAt(0, xyzTiles); // Show tiles
      }
      setTilesVisible(!tilesVisible);
    }
  };

  const addSolarPanel = () => {
    if (mapRef.current) {
<<<<<<< HEAD
      const center = mapRef.current.getCenter();
      const latOffset = 0.000009; // ~2 meter
      const lngOffset = 0.0000045; // ~1 meter
=======
      const center = mapRef.current?.getCenter();
      if (!center) return;

      const latOffset = 0.000018; // ~2 meter
      const lngOffset = 0.000009; // ~1 meter
>>>>>>> be13aef514557db11807d86f5c9fa7865f8ae1c6

      const solarPanelCoords = [
        { lat: center.lat() - latOffset, lng: center.lng() - lngOffset },
        { lat: center.lat() - latOffset, lng: center.lng() + lngOffset },
        { lat: center.lat() + latOffset, lng: center.lng() + lngOffset },
        { lat: center.lat() + latOffset, lng: center.lng() - lngOffset },
      ];

      const zoom = mapRef.current.getZoom();
      // Cek zoom, jika kurang dari 18, ubah menjadi 22
      if (!zoom) return;
      if (zoom < 18) {
        mapRef.current.setZoom(22);
      }

      new google.maps.Polygon({
        paths: solarPanelCoords,
        strokeColor: "#FFD700",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FFD700",
        fillOpacity: 0.35,
        draggable: true,
        map: mapRef.current,
      });
    }
  };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      setMapLoaded(true); // Set mapLoaded to true when the map is loaded
    },
    []
  );

  const toggleMapType = () => {
    setMapType((prev) => (prev === "roadmap" ? "satellite" : "roadmap"));
  };

  return (
    <div className="relative w-full">
      <div className="flex justify-center space-x-4 p-4 bg-gray-200">
        <Button onClick={() => setActivePage("input")}>Input</Button>
        <Button onClick={() => setActivePage("design")} className="font-bold">
          Design
        </Button>
        <Button onClick={() => setActivePage("result")}>Result</Button>
      </div>

      {activePage === "design" && (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={5}
            onLoad={onLoad}
            mapTypeId={mapType}
          />
        </LoadScript>
      )}

<<<<<<< HEAD
      {activePage === "design" && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          <Button 
            onClick={toggleTiles} 
            className="bg-white text-black rounded-full" 
            title={tilesVisible ? "Hide Solar Heatmap" : "View Solar Heatmap"}
          >
            ☀️
          </Button>
          <Button 
            onClick={addSolarPanel} 
            className="bg-white text-black rounded-full" 
            title="Add Solar Panel"
          >
            ➕
          </Button>
          <Button 
            onClick={toggleMapType} 
            className="bg-white text-black rounded-full" 
            title={mapType === "roadmap" ? "Switch to Satellite" : "Switch to Road Map"}
          >
            {mapType === "roadmap" ? "🛰️" : "🗺️"}
          </Button>
=======
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
            <Button
              onClick={toggleTiles}
              className="bg-white text-black rounded-full"
              title={tilesVisible ? "Hide Solar Heatmap" : "View Solar Heatmap"}
            >
              ☀️
            </Button>
            <Button
              onClick={addSolarPanel}
              className="bg-white text-black rounded-full"
              title="Add Solar Panel"
            >
              ➕
            </Button>
            <Button
              onClick={toggleMapType}
              className="bg-white text-black rounded-full"
              title={
                mapType === "roadmap"
                  ? "Switch to Satellite"
                  : "Switch to Road Map"
              }
            >
              {mapType === "roadmap" ? "🛰️" : "🗺️"}
            </Button>
          </div>
>>>>>>> be13aef514557db11807d86f5c9fa7865f8ae1c6
        </div>
      )}

      {activePage === "input" && (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl">Input</h1>
        </div>
      )}

      {activePage === "result" && (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl">Result</h1>
        </div>
      )}
    </div>
  );
};

export default SolarPlanning;
