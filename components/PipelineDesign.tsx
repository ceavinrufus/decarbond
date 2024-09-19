"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

const containerStyle = {
  width: "100%", // Full width of the screen
  height: "75vh", // 3/4 of the screen height
};

const center = {
  lat: -6.2,
  lng: 106.816666,
};

const PipelineDesign: React.FC = () => {
  const [showMarker, setShowMarker] = useState(false);
  const [markers, setMarkers] = useState<{ lat: number; lng: number }[]>([]);
  const [polylines, setPolylines] = useState<{ lat: number; lng: number }[][]>(
    []
  );
  const [focusIndex, setFocusIndex] = useState<number | null>(null); // Index for focused marker
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

        // If there's a focused marker, create a branch from that marker
        if (focusIndex !== null) {
          const focusedMarker = markers[focusIndex];
          setPolylines((current) => [...current, [focusedMarker, newMarker]]);
        } else {
          // If two markers exist, create a polyline between them (default behavior)
          if (markers.length >= 1) {
            setPolylines((current) => [
              ...current,
              [markers[markers.length - 1], newMarker],
            ]);
          }
        }
        // Add new marker
        setMarkers((current) => [...current, newMarker]);
        // Reset focus after adding branch
        setFocusIndex(null);
      }
    },
    [markers, focusIndex]
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

  // Handle marker click to focus on the marker
  const handleMarkerClick = (index: number) => {
    setFocusIndex(index); // Set the clicked marker as the focus
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
          onLoad={onLoadMap} // Ensure the map is loaded before using the ElevationService
          onClick={handleMapClick}
          onRightClick={handleMapRightClick} // Handle right-click
        >
          {/* Render markers */}
          {showMarker &&
            markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker}
                onClick={() => handleMarkerClick(index)} // Set marker as focus when clicked
              />
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

      {/* Show Marker Button */}
      <div className="flex items-center space-x-2 mt-4">
        <Switch
          checked={showMarker}
          onCheckedChange={() => setShowMarker(!showMarker)}
          id="show-marker"
        />
        <Label htmlFor="show-marker">Show Marker</Label>
      </div>
    </div>
  );
};

export default PipelineDesign;
