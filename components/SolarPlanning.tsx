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
  const mapRef = useRef<google.maps.Map | null>(null);

  const toggleTiles = () => {
    if (mapRef.current) {
      const xyzTiles = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          if (zoom > 10) {
            return "";
          }
          return `/database/SolarHeatMap/${zoom}/${coord.x}/${coord.y}.png`;
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

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

  return (
    <div className="relative w-full h-screen">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={5}
          onLoad={onLoad}
        />
      </LoadScript>

      <div className="flex items-center space-x-2 mt-4">
        <Button onClick={toggleTiles}>Toggle Tiles</Button>
      </div>
    </div>
  );
};

export default SolarPlanning;
