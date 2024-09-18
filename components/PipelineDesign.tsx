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
      if (e.latLng) {
        const newMarker = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkers((current) => [...current, newMarker]);

        // If two markers exist, create a polyline between them
        if (markers.length >= 1) {
          setPolylines((current) => [
            ...current,
            [markers[markers.length - 1], newMarker],
          ]);
        }
      }
    },
    [markers]
  );

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
          <Marker position={markers[0]} />
          <Marker position={markers[markers.length - 1]} />

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
        {/* Undo Button */}
        <Button onClick={() => {}} variant="default">
          Save
        </Button>
      </div>
    </div>
  );
};

export default PipelineDesign;
