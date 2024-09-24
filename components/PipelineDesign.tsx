"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { computeDistanceBetween } from "spherical-geometry-js"; // Google Maps method to calculate distance

const containerStyle = {
  width: "100%", // Full width of the screen
  height: "75vh", // 3/4 of the screen height
};

const center = {
  lat: -6.2,
  lng: 106.816666,
};

interface IPath {
  lat: number;
  lng: number;
}

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
  const [pipeLength, setPipeLength] = useState<number>(0); // Total pipe length
  const [bufferWidth, setBufferWidth] = useState<number>(30); // Default buffer width (meters)
  const [landUseArea, setLandUseArea] = useState<number>(0); // Land use area
  const [landTypes, setLandTypes] = useState({
    residential: 0,
    commercial: 0,
    agricultural: 0,
    industrial: 0,
    forested: 0,
    wetlands: 0,
  }); // Land type percentages
  const [materialCost, setMaterialCost] = useState<number>(100); // Cost per meter
  const [constructionCost, setConstructionCost] = useState<number>(150); // Construction cost per meter
  const [landUseCostPerCubicMeter, setLandUseCostPerCubicMeter] =
    useState<number>(50); // Cost per cubic meter for land use

  const elevationServiceRef = useRef<google.maps.ElevationService | null>(null);

  // Initialize ElevationService when the map is loaded
  const onLoadMap = useCallback(() => {
    if (!elevationServiceRef.current && window.google) {
      elevationServiceRef.current = new google.maps.ElevationService();
    }
  }, []);

  // Pipe length calculation (using Google Maps' `computeDistanceBetween`)
  const calculatePipeLength = useCallback((polylines: any) => {
    let totalLength = 0;
    polylines.forEach((path: any) => {
      let segmentLength = 0;
      const [start, end] = path;
      if (start && end) {
        segmentLength = computeDistanceBetween(
          new google.maps.LatLng(start.lat ?? 0, start.lng),
          new google.maps.LatLng(end.lat, end.lng)
        );
      }
      totalLength += segmentLength;
    });
    setPipeLength(totalLength / 1000); // Convert to kilometers
    return totalLength;
  }, []);

  // Land use calculation based on pipe length and buffer width
  const calculateLandUse = useCallback(() => {
    const pipeArea = pipeLength * bufferWidth; // Pipe area
    const bufferZoneArea = pipeLength * bufferWidth; // Buffer zone area
    setLandUseArea(pipeArea + bufferZoneArea); // Total land use
  }, [pipeLength, bufferWidth]);

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
        // Recalculate pipe length whenever a marker is added
        calculatePipeLength([
          ...polylines,
          [markers[markers.length - 1], newMarker],
        ]);
        // Recalculate land use
        calculateLandUse();
        // Reset focus after adding branch
        setFocusIndex(null);
      }
    },
    [markers, focusIndex, calculatePipeLength, calculateLandUse]
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

  // Calculate total costs
  const calculateCosts = () => {
    const pipeMaterialCost = pipeLength * materialCost;
    const pipeConstructionCost = pipeLength * constructionCost;
    const landUseCost = landUseArea * landUseCostPerCubicMeter;
    return pipeMaterialCost + pipeConstructionCost + landUseCost;
  };

  // Calculate job creation
  const calculateJobs = () => {
    const directJobs = 10 * (pipeLength / 1000); // Jobs per km
    const indirectJobs = 10 * (pipeLength / 1000);
    return directJobs + indirectJobs;
  };

  useEffect(() => {
    calculateLandUse(); // Recalculate land use when pipe length or buffer width changes
  }, [pipeLength, bufferWidth]);

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

      {/* Display calculated details */}
      <div className="mt-4">
        <h3>Pipeline Details:</h3>
        <p>Total Pipe Length: {pipeLength.toFixed(2)} km</p>
        <p>Land Use Area: {landUseArea.toFixed(2)} sq.m</p>
        <p>Total Cost: ${calculateCosts().toFixed(2)}</p>
        <p>Total Jobs Created: {calculateJobs()}</p>
      </div>
    </div>
  );
};

export default PipelineDesign;
