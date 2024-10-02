"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { computeDistanceBetween } from "spherical-geometry-js"; // Google Maps method to calculate distance

const containerStyle = {
  width: "100%", // Full width of the screen
  height: "75vh", // 3/4 of the screen height
};

const center = {
  lat: -3.2049,
  lng: 104.0822,
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
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [elevation, setElevation] = useState<number | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pipeLength, setPipeLength] = useState<number>(0); // Total pipe length
  const [bufferWidth, setBufferWidth] = useState<number>(30); // Default buffer width (meters)
  const [landUseArea, setLandUseArea] = useState<number>(0); // Land use area
  const [materialCost, setMaterialCost] = useState<number>(100); // Cost per meter
  const [constructionCost, setConstructionCost] = useState<number>(150); // Construction cost per meter
  const [landUseCostPerCubicMeter, setLandUseCostPerCubicMeter] =
    useState<number>(50); // Cost per cubic meter for land use
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [tilesVisible, setTilesVisible] = useState<string[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const elevationServiceRef = useRef<google.maps.ElevationService | null>(null);

  const onLoadMap = useCallback(
    (map: google.maps.Map) => {
      if (!elevationServiceRef.current && window.google) {
        elevationServiceRef.current = new google.maps.ElevationService();
      }
      mapRef.current = map;
    },
    [mapRef]
  );

  const calculatePipeLength = useCallback((polylines: any) => {
    let totalLength = 0;
    polylines.forEach((path: any) => {
      const [start, end] = path;
      if (start && end) {
        totalLength += computeDistanceBetween(
          new google.maps.LatLng(start.lat, start.lng),
          new google.maps.LatLng(end.lat, end.lng)
        );
      }
    });
    setPipeLength(totalLength / 1000); // Convert to kilometers
  }, []);

  const calculateLandUse = useCallback(() => {
    const pipeArea = pipeLength * bufferWidth;
    const bufferZoneArea = pipeLength * bufferWidth;
    setLandUseArea(pipeArea + bufferZoneArea); // Total land use
  }, [pipeLength, bufferWidth]);

  const toggleTiles = (mode: string) => {
    if (mapRef.current) {
      const xyzTiles = new google.maps.ImageMapType({
        getTileUrl: (coord, zoom) => {
          if (zoom > 10) {
            return "";
          }
          return `/${mode}/${zoom}/${coord.x}/${coord.y}.png`;
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: 10,
        minZoom: 5,
        name: mode,
      });

      const overlayMapTypes = mapRef.current.overlayMapTypes;

      if (tilesVisible.includes(mode)) {
        // Find the index of the layer to remove based on the mode (or name)
        const indexToRemove = overlayMapTypes.getArray().findIndex(
          (layer) => layer && layer.name === mode
        );

        if (indexToRemove !== -1) {
          overlayMapTypes.removeAt(indexToRemove); // Remove the correct tile layer
        }

        setTilesVisible(tilesVisible.filter((tile) => tile !== mode));
      } else {
        overlayMapTypes.insertAt(0, xyzTiles); // Add the new tile layer
        setTilesVisible([...tilesVisible, mode]);
      }
    }
  };

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newMarker = { lat: e.latLng.lat(), lng: e.latLng.lng() };

        if (focusIndex !== null) {
          const focusedMarker = markers[focusIndex];
          setPolylines((current) => [...current, [focusedMarker, newMarker]]);
        } else {
          if (markers.length >= 1) {
            setPolylines((current) => [
              ...current,
              [markers[markers.length - 1], newMarker],
            ]);
          }
        }
        setMarkers((current) => [...current, newMarker]);
        calculatePipeLength([
          ...polylines,
          [markers[markers.length - 1], newMarker],
        ]);
        calculateLandUse();
        setFocusIndex(null);
      }
    },
    [markers, focusIndex, calculatePipeLength, calculateLandUse]
  );

  const handleMapRightClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && elevationServiceRef.current) {
      const clickedPosition = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      elevationServiceRef.current.getElevationForLocations(
        {
          locations: [clickedPosition],
        },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            setElevation(results[0].elevation);
            setInfoWindowPosition(clickedPosition); // Show info window at clicked position
          }
        }
      );
    }
  }, []);

  const handleMarkerClick = (index: number) => {
    setFocusIndex(index);
  };

  const calculateCosts = () => {
    const pipeMaterialCost = pipeLength * materialCost;
    const pipeConstructionCost = pipeLength * constructionCost;
    const landUseCost = landUseArea * landUseCostPerCubicMeter;
    return pipeMaterialCost + pipeConstructionCost + landUseCost;
  };

  const calculateJobs = () => {
    const directJobs = 10 * (pipeLength / 1000); // Jobs per km
    const indirectJobs = 10 * (pipeLength / 1000);
    return directJobs + indirectJobs;
  };

  // Example for carbon impact calculations
  const calculateCarbonImpact = () => {
    const carbonAbsorbed = landUseArea * 0.5; // Example factor for carbon absorption
    const carbonInjected = landUseArea * 0.3; // Example factor for carbon injection
    return { carbonAbsorbed, carbonInjected };
  };

  // Capacity estimation output - example function
  const calculateCapacityEstimation = () => {
    return pipeLength * 100; // Example calculation for capacity estimation
  };

  useEffect(() => {
    calculateLandUse(); // Recalculate land use when pipe length or buffer width changes
  }, [pipeLength, bufferWidth]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onLoadMap}
            onClick={handleMapClick}
            onRightClick={handleMapRightClick}
          >
            {showMarker &&
              markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker}
                  onClick={() => handleMarkerClick(index)}
                />
              ))}

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

        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          <Button
            onClick={() => toggleTiles("PIPELINE")}
            className={`${tilesVisible.includes("PIPELINE") ? "bg-primary text-white" : "bg-white text-black"
              } rounded-full`}
          >
            PIPELINE
          </Button>
          <Button
            onClick={() => toggleTiles("PERKEBUNAN")}
            className={`${tilesVisible.includes("PERKEBUNAN") ? "bg-primary text-white" : "bg-white text-black"
              } rounded-full`}
          >
            PLANTATION
          </Button>
          <Button
            onClick={() => toggleTiles("POWERPLANT")}
            className={`${tilesVisible.includes("POWERPLANT") ? "bg-primary text-white" : "bg-white text-black"
              } rounded-full`}
          >
            POWER PLANT
          </Button>
          <Button
            onClick={() => toggleTiles("SAWAH")}
            className={`${tilesVisible.includes("SAWAH") ? "bg-primary text-white" : "bg-white text-black"
              } rounded-full`}
          >
            RICEFIELD
          </Button>
          <Button
            onClick={() => toggleTiles("WELL")}
            className={`${tilesVisible.includes("WELL") ? "bg-primary text-white" : "bg-white text-black"
              } rounded-full`}
          >
            WELL
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2 mt-4">
        <div className="">
          <Switch
            checked={showMarker}
            onCheckedChange={() => setShowMarker(!showMarker)}
            id="show-marker"
          />
          <Label htmlFor="show-marker">Show Marker</Label>
        </div>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="default">Show Summary</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Pipeline Design Summary</DrawerTitle>
              <DrawerDescription>
                Overview of the pipeline design costs and impact.
              </DrawerDescription>
            </DrawerHeader>

            <div className="text-sm px-4 grid grid-cols-4">
              <div className="mt-4">
                <h3 className="text-lg font-bold underline">Summary</h3>
                <p>Pipe Length: {pipeLength.toFixed(2)} km</p>
                <p>Total Cost: {formatRupiah(calculateCosts())}</p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold underline">Project Area</h3>
                <p>Pipe Area: {(pipeLength * bufferWidth).toFixed(2)} m²</p>
                <p>Buffer Area: {(pipeLength * bufferWidth).toFixed(2)} m²</p>
                <p>Total Area: {landUseArea.toFixed(2)} m²</p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold underline">Cost Detail</h3>
                <p>Material Cost: {formatRupiah(pipeLength * materialCost)}</p>
                <p>
                  Construction Cost:{" "}
                  {formatRupiah(pipeLength * constructionCost)}
                </p>
                <p>
                  Land Use Cost:{" "}
                  {formatRupiah(landUseArea * landUseCostPerCubicMeter)}
                </p>
                <p>
                  Total Cost:{" "}
                  {formatRupiah(
                    calculateCosts() - landUseArea * landUseCostPerCubicMeter
                  )}
                </p>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold underline">
                  Socio-Environmental Impact
                </h3>
                <p>Jobs Created: {calculateJobs().toFixed(0)}</p>
                <p>Carbon Impact:</p>
                <ol className="list-disc ml-5">
                  <li>
                    Carbon Absorbed: {calculateCarbonImpact().carbonAbsorbed}
                  </li>
                  <li>
                    Carbon Injected: {calculateCarbonImpact().carbonInjected}
                  </li>
                </ol>
                <p>Capacity Estimation: {calculateCapacityEstimation()} m³</p>
              </div>
            </div>
            <DrawerClose />
            <DrawerFooter>
              <Button variant="default" onClick={() => setDrawerOpen(false)}>
                Close
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-10">
          <div className="">
            <label className="block mb-2 mt-4" htmlFor="bufferWidth">
              Buffer Width (meters):
            </label>
            <input
              type="number"
              id="bufferWidth"
              value={bufferWidth}
              onChange={(e) => setBufferWidth(Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="">
            <label className="block mb-2 mt-4" htmlFor="materialCost">
              Material Cost (Rp per meter):
            </label>
            <input
              type="number"
              id="materialCost"
              value={materialCost}
              onChange={(e) => setMaterialCost(Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="">
            <label className="block mb-2 mt-4" htmlFor="constructionCost">
              Construction Cost (Rp per meter):
            </label>
            <input
              type="number"
              id="constructionCost"
              value={constructionCost}
              onChange={(e) => setConstructionCost(Number(e.target.value))}
              className="border rounded px-2 py-1"
            />
          </div>

          <div className="">
            <label
              className="block mb-2 mt-4"
              htmlFor="landUseCostPerCubicMeter"
            >
              Land Use Cost (Rp per cubic meter):
            </label>
            <input
              type="number"
              id="landUseCostPerCubicMeter"
              value={landUseCostPerCubicMeter}
              onChange={(e) =>
                setLandUseCostPerCubicMeter(Number(e.target.value))
              }
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineDesign;
