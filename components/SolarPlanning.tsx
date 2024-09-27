"use client";

import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import Chart from "./Chart";

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
  const [energyType, setEnergyType] = useState("Annual"); // Dropdown state
  const [energyConsumption, setEnergyConsumption] = useState<any>({ annual: '', monthly: Array(12).fill('') });
  const mapRef = useRef<google.maps.Map | null>(null);
  const solarPanel = useRef<google.maps.Rectangle[]>([]); // Use ref to store solarPanel array
  let infoWindow: google.maps.InfoWindow | undefined;
  const [resultData, setResultData] = useState<string>(""); // Store result data here
  var contentString="";
  
  const handleEnergyTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEnergyType(event.target.value);
  };
  const handleEnergyInputChange = (index: number, value: string) => {
    if (energyType === "Annual") {
      setEnergyConsumption({ ...energyConsumption, annual: value });
    } else {
      const newMonthly = [...energyConsumption.monthly];
      newMonthly[index] = value;
      setEnergyConsumption({ ...energyConsumption, monthly: newMonthly });
    }
  };

  const toggleTiles = () => {
    if (mapRef.current) {
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
      const center = mapRef.current?.getCenter();
      if (!center) return;
      const spCount = solarPanel.current.length;
      const latOffset = 0.000018; // ~2 meter
      const lngOffset = 0.000009; // ~1 meter

      const solarPanelCoords = {
        north: center.lat() + latOffset,
        south: center.lat() - latOffset,
        east: center.lng() + lngOffset,
        west: center.lng() - lngOffset,
      };

      const zoom = mapRef.current.getZoom();
      // Cek zoom, jika kurang dari 18, ubah menjadi 22
      if (!zoom) return;
      if (zoom < 18) {
        mapRef.current.setZoom(22);
      }

      // Define the rectangle and set its editable property to true.
      const newRectangle = new google.maps.Rectangle({
        bounds: solarPanelCoords,
        editable: false,
        draggable: true,
        strokeColor: "#0000FF",  
        fillColor: "#0000FF",   
      });
      newRectangle.setMap(mapRef.current);
      solarPanel.current.push(newRectangle); // Push new rectangle into the array

      // Add an event listener on the rectangle.
      newRectangle.addListener("bounds_changed", () => showNewRect(newRectangle));
      // Define an info window on the map.
      infoWindow = new google.maps.InfoWindow();
    }
  };

  async function showNewRect(sp: google.maps.Rectangle) {
    const ne = sp.getBounds()?.getNorthEast();
    const sw = sp.getBounds()?.getSouthWest();
    if (!ne || !sw || !mapRef.current) return;
    
    const centerLat = (ne.lat() + sw.lat()) / 2;
    const centerLng = (ne.lng() + sw.lng()) / 2;
    const url = `https://api.globalsolaratlas.info/data/lta?loc=${centerLat},${centerLng}`;
  
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        const pvout = data.annual.data.PVOUT_csi;
  
        const panelCapacity = 350; // Watts
        const panelCount = solarPanel.current.length;
        const installationSize = (panelCount * panelCapacity) / 1000; // kWp
        const installationCost = panelCount * 1700000; // Assuming 1.7M IDR per panel
  
        const yearlySolarProduction = pvout * installationSize; // kWh/year
  
        contentString =
          "<b>PVOUT</b><br>" +
          "Latitude: " + centerLat +
          "<br>Longitude: " + centerLng +
          "<br>Potential: " + pvout + " kWh/kWp" +
          "<br>Installation Size: " + installationSize + " kWp" +
          "<br>Installation Cost: Rp " + installationCost.toLocaleString() +
          "<br>Yearly Solar Production: " + yearlySolarProduction + " kWh";
        setResultData(contentString); // Store the content string in resultData state

      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });

  }
  

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
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

      <div
        className={`relative w-full h-full ${
          activePage !== "design" ? "hidden" : ""
        }`}
      >
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={5}
            onLoad={onLoad}
            mapTypeId={mapType}
          />
        </LoadScript>

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
      </div>

      <div
        className={`flex items-center justify-center h-full ${
          activePage !== "input" ? "hidden" : ""
        }`}
      >
        <div className={`flex flex-col items-center justify-center h-full ${activePage !== "input" ? "hidden" : ""}`}>
        <h1 className="text-3xl">Input</h1>

        <div className="mt-4">
          <label className="mr-4">Energy Consumption Type:</label>
          <select value={energyType} onChange={handleEnergyTypeChange} className="border p-2">
            <option value="Annual">Annual</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Display input based on selection */}
        {energyType === "Annual" ? (
          <div className="mt-4">
            <label>Annual Energy Consumption (kWh/year):</label>
            <input
              type="number"
              value={energyConsumption.annual}
              onChange={(e) => handleEnergyInputChange(0, e.target.value)}
              className="border p-2 ml-2"
            />
          </div>
        ) : (
          <div className="mt-4">
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
              <div key={index} className="mt-2">
                <label>{month} Energy Consumption (kWh):</label>
                <input
                  type="number"
                  value={energyConsumption.monthly[index]}
                  onChange={(e) => handleEnergyInputChange(index, e.target.value)}
                  className="border p-2 ml-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <div
        className={`flex items-center justify-center h-full ${
          activePage !== "result" ? "hidden" : ""
        }`}
      >
        <div className="p-4 mt-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Calculation Results</h2>
          <p dangerouslySetInnerHTML={{ __html: resultData }} />
        </div>
      </div>
    </div>
  );
};

export default SolarPlanning;
