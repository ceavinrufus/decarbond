"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
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
  const [elevation, setElevation] = useState<number | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const elevationServiceRef = useRef<google.maps.ElevationService | null>(null);

  // Initialize ElevationService when the map is loaded
  const onLoadMap = useCallback(() => {
    if (!elevationServiceRef.current && window.google) {
      elevationServiceRef.current = new google.maps.ElevationService();
    }
  }, []);

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

  // Handle right-click on the map to show elevation info
  const handleMapRightClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && elevationServiceRef.current) {
      const clickedPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      // Request elevation data for the clicked point
      elevationServiceRef.current.getElevationForLocations(
        {
          locations: [clickedPosition],
        },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            setElevation(results[0].elevation);
            setInfoWindowPosition(clickedPosition); // Show info window at clicked position
          } else {
            setElevation(null);
          }
        }
      );
    }
  }, []);

  return (
    <div className="w-full">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onLoad={onLoadMap} // Ensure the map is loaded before using the ElevationService
          onClick={handleMapClick}
          onRightClick={handleMapRightClick} // Handle right-click
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

          {/* Show InfoWindow with elevation and coordinates */}
          {infoWindowPosition && elevation !== null && (
            <InfoWindow
              position={infoWindowPosition}
              onCloseClick={() => setInfoWindowPosition(null)}
            >
              <div>
                <p>
                  <strong>Coordinates:</strong>{" "}
                  {infoWindowPosition.lat.toFixed(6)},{" "}
                  {infoWindowPosition.lng.toFixed(6)}
                </p>
                <p>
                  <strong>Elevation:</strong> {elevation.toFixed(2)} meters
                </p>
              </div>
            </InfoWindow>
          )}
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
