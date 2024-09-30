"use client";

import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Chart Display Function
const renderChart = (chartType: string, chartData: any) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${chartType} Chart Example` },
    },
  };
  return (
    <div className="w-full max-h-[75vh] h-full p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Sample chart data for all charts
const generateData = (label: string) => ({
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  datasets: [
    {
      label,
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
});

const SolarPlanning: React.FC = () => {
  const [tilesVisible, setTilesVisible] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [activePage, setActivePage] = useState<"input" | "design" | "result">("design");
  const [energyType, setEnergyType] = useState("Annual");
  const [energyConsumption, setEnergyConsumption] = useState<any>({ annual: "", monthly: Array(12).fill("") });
  const [resultData, setResultData] = useState<string>(""); // Store result data here
  const mapRef = useRef<google.maps.Map | null>(null);
  const solarPanel = useRef<google.maps.Rectangle[]>([]);

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
        mapRef.current.overlayMapTypes.removeAt(0);
      } else {
        mapRef.current.overlayMapTypes.insertAt(0, xyzTiles);
      }
      setTilesVisible(!tilesVisible);
    }
  };

  const addSolarPanel = () => {
    if (mapRef.current) {
      const center = mapRef.current?.getCenter();
      if (!center) return;
      const latOffset = 0.000018;
      const lngOffset = 0.000009;

      const solarPanelCoords = {
        north: center.lat() + latOffset,
        south: center.lat() - latOffset,
        east: center.lng() + lngOffset,
        west: center.lng() - lngOffset,
      };

      const zoom = mapRef.current.getZoom();
      if (!zoom || zoom < 18) {
        mapRef.current.setZoom(22);
      }

      const newRectangle = new google.maps.Rectangle({
        bounds: solarPanelCoords,
        editable: false,
        draggable: true,
        strokeColor: "#0000FF",
        fillColor: "#0000FF",
      });
      newRectangle.setMap(mapRef.current);
      solarPanel.current.push(newRectangle);
    }
  };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
    },
    [mapRef]
  );

  const toggleMapType = () => {
    setMapType((prev) => (prev === "roadmap" ? "satellite" : "roadmap"));
  };

  // Chart data definitions
  const chartData1 = generateData("Chart 1");
  const chartData2 = generateData("Chart 2");
  const chartData3 = generateData("Chart 3");

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
        className={`relative w-full h-full ${activePage !== "design" ? "hidden" : ""}`}
      >
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <GoogleMap mapContainerStyle={{ width: "100%", height: "75vh" }} center={{ lat: -2.5, lng: 118 }} zoom={5} onLoad={onLoad} mapTypeId={mapType} />
        </LoadScript>

        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
          <Button onClick={toggleTiles} className="bg-white text-black rounded-full">
            ☀️
          </Button>
          <Button onClick={addSolarPanel} className="bg-white text-black rounded-full">
            ➕
          </Button>
          <Button onClick={toggleMapType} className="bg-white text-black rounded-full">
            {mapType === "roadmap" ? "🛰️" : "🗺️"}
          </Button>
        </div>
      </div>

      <div className={`flex flex-col space-y-6 items-center justify-center h-full ${activePage !== "result" ? "hidden" : ""}`}>
        <h1 className="text-3xl">Results</h1>
        <p dangerouslySetInnerHTML={{ __html: resultData }} />
        {renderChart("Chart 1", chartData1)}
        {renderChart("Chart 2", chartData2)}
        {renderChart("Chart 3", chartData3)}
      </div>
    </div>
  );
};

export default SolarPlanning;
