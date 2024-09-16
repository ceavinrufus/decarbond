"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { Button } from "@/components/ui/button"; // Import Shadcn Button

const containerStyle = {
  width: "100%", // Full width of the screen
  height: "75vh", // 3/4 of the screen height
};

const center = {
  lat: -6.2,
  lng: 106.816666,
};

const PipelineDesign: React.FC = () => {
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polylines, setPolylines] = useState<{ lat: number; lng: number }[][]>(
    []
  );

  // Handle click on map to add markers and update polyline
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && markers.length < 2) {
        const newMarker = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkers((current) => [...current, newMarker]);

        // If two markers exist, create a polyline between them
        if (markers.length === 1) {
          setPolylines((current) => [...current, [markers[0], newMarker]]);
        }
      }
    },
    [markers]
  );

  // Undo last marker and update polyline
  const handleUndo = () => {
    setMarkers((current) => {
      const updatedMarkers = current.slice(0, -1);
      // Update polylines
      if (updatedMarkers.length === 1) {
        setPolylines([]);
      }
      return updatedMarkers;
    });
  };

  // Reset markers and polylines
  const handleReset = () => {
    setMarkers([]);
    setPolylines([]);
  };

  return (
    <div className="w-full">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={handleMapClick}
        >
          {/* Render markers */}
          {markers.map((marker, index) => (
            <Marker key={index} position={marker} />
          ))}

          {/* Render polylines */}
          {polylines.map((path, index) => (
            <Polyline
              key={index}
              path={path}
              options={{
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <div className="mt-4 flex space-x-2">
        {/* Reset Button */}
        <Button onClick={handleReset} variant="destructive">
          Reset
        </Button>

        {/* Undo Button */}
        <Button onClick={handleUndo} variant="default">
          Undo
        </Button>
      </div>
    </div>
  );
};

export default PipelineDesign;
