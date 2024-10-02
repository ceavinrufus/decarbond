"use client";

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
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
import GaugeChart from "./GaugeChart";

// Constants
const defaultElectricityPrice = 1444.7;
const co2PerKWh = 0.85; // kg CO2 per kWh green energy
const kgCO2PerTree = 22; // kg CO2 absorbed by a tree annually
const monthlyPercentages = [7.8, 7.5, 8.5, 8.7, 8.9, 8.9, 9.0, 9.1, 8.9, 8.7, 7.8, 7.2];

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
// Chart Display Function
const renderChart = (chartType: string, chartData: any) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${chartType}` },
    },
  };
  return (
    <div className="w-full max-h-[75vh] h-full p-4 min-h-60">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Sample chart data for all charts
const generateData = (label: string, percentages: number[], totalValue: number) => {
  const monthlyValues = percentages.map((percentage) => Math.round((totalValue * percentage) / 100));
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label,
        data: monthlyValues,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
};

const containerStyle = {
  width: "100%",
  height: "75vh",
};

const center = {
  lat: -2.5,
  lng: 118,
};

const SolarPlanning: React.FC = () => {
  interface ResultData {
    installationSize: number;
    averagePotential: number;
    installationCost: number;
    potential:number[];
    treesNeeded: number;
    greenEnergy: number;
    co2Saved: number;
    solarProduction: number;
    optimumTilt:number;
    savings: number;
    energyCoverage: number;
    batteryStorageAh:number;
    neededEnergy:number;
  }
  interface SolarModule {
    model: string;
    rating: number;
    width: number;
    height: number;
  }
  
  const defaultModule: SolarModule = {
    model: 'Jinko Solar JKM310M-72B',
    rating: 310,
    width: 0.992,
    height: 1.956
  };
  
  const moduleData: SolarModule[] = [
    { model: 'Jinko Solar JKM310M-72B', rating: 310, width: 0.992, height: 1.956 },
    { model: 'SunPower SPR P3 335 BLK', rating: 335, width: 0.998, height: 1.69 },
    { model: 'SunPower SPR P3 370 BLK', rating: 370, width: 1.16, height: 1.69 },
    { model: 'Panasonic VBHN325SA6', rating: 325, width: 1.053, height: 1.59 }
  ];
  const [tilesVisible, setTilesVisible] = useState(false);
  const [lastRectangleBounds, setLastRectangleBounds] = useState<google.maps.LatLngBounds | null>(null);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");
  const [activePage, setActivePage] = useState<"input" | "design" | "result">(
    "input"
  );
  const [energyType, setEnergyType] = useState("Annual"); // Dropdown state
  const [energyConsumption, setEnergyConsumption] = useState<any>({ annual: '', monthly: Array(12).fill('') });
  const [electricityPrice, setElectricityPrice] = useState(defaultElectricityPrice);
  const [resultData, setResultData] = useState({
    installationSize: 0,
    averagePotential: 0,
    potential:[0,0,0,0,0,0,0,0,0,0,0,0],
    installationCost: 0,
    treesNeeded: 0,
    greenEnergy: 0,
    co2Saved: 0,
    optimumTilt:0,
    solarProduction: 0,
    savings: 0,
    energyCoverage: 0,
    batteryStorageAh: 0,  // Default to 0
    neededEnergy: 0,      // Default to 0
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const solarPanel = useRef<google.maps.Rectangle[]>([]); // Use ref to store solarPanel array
  
  let infoWindow: google.maps.InfoWindow | undefined;
 	
  var contentString="";
  // Solar Module Selection
  const [open, setOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<SolarModule>(defaultModule);
  const [customModule, setCustomModule] = useState<{ [key: string]: string }>({ model: '', rating: '', width: '', height: '' });

  const handleSelect = (module: SolarModule) => {
    setSelectedModule(module);
    setOpen(false); // Close dialog after selection
  };

  const handleCustomInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomModule((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomSelect = () => {
    const custom: SolarModule = {
      model: customModule.model,
      rating: Number(customModule.rating),
      width: Number(customModule.width),
      height: Number(customModule.height)
    };
    setSelectedModule(custom);
    setOpen(false); // Close dialog after selection
  };

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
        const bounds = lastRectangleBounds; 
        const center = mapRef.current?.getCenter();
        if (!center) return;

        const spCount = solarPanel.current.length;
        const latOffset = 0.000009*selectedModule.height; // ~2 meter
        const lngOffset = 0.000009*selectedModule.width; // ~1 meter

        let solarPanelCoords;
        var newNorthEast;
        var newSouthWest;
        if (bounds) {
            // Jika ada bounds sebelumnya, hitung posisi rectangle baru di sebelah kanan
            newNorthEast = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng()+0.000019);
            newSouthWest = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng()+0.000019);
            
            // Set solarPanelCoords menggunakan posisi rectangle baru
            solarPanelCoords = {
                north: newNorthEast.lat()+ latOffset,
                south: newSouthWest.lat()- latOffset,
                east: newNorthEast.lng() +lngOffset,
                west: newSouthWest.lng() -lngOffset,
            };
        } else {
          newNorthEast = new google.maps.LatLng(center.lat(), center.lng());
          newSouthWest = new google.maps.LatLng(center.lat(), center.lng());
            // Jika tidak ada bounds, gunakan posisi tengah peta
            solarPanelCoords = {
                north: center.lat() + latOffset,
                south: center.lat() - latOffset,
                east: center.lng() + lngOffset,
                west: center.lng() - lngOffset,
            };
        }

        const zoom = mapRef.current.getZoom();
        if (!zoom) return;
        if (zoom < 18) {
            mapRef.current.setZoom(22);
        }

       var newRectangle = new google.maps.Rectangle({
            bounds: solarPanelCoords,
            editable: false,
            draggable: true,
            strokeColor: "#0000FF",  
            fillColor: "#0000FF",   
        });
        newRectangle.setMap(mapRef.current);
        solarPanel.current.push(newRectangle); // Push new rectangle into the array
        newRectangle.addListener("bounds_changed", () => boundChangeEvent(newRectangle));
        // Add event listener for double-click to remove rectangle
        newRectangle.addListener("dblclick", () => {
          newRectangle.setMap(null); // Remove from the map
          solarPanel.current = solarPanel.current.filter(rect => rect !== newRectangle); // Remove from the array
         });
        // Add an event listener on the rectangle.
        google.maps.event.addListener(mapRef.current, "idle", () => showNewRect(newRectangle, selectedModule.rating));
        // Define an info window on the map.
        infoWindow = new google.maps.InfoWindow();

        // Update lastRectangleBounds with the new rectangle's bounds
        setLastRectangleBounds(new google.maps.LatLngBounds(newSouthWest, newNorthEast));
    }
  };
  function boundChangeEvent(rectangle:google.maps.Rectangle) {
    const bounds = rectangle.getBounds(); 
    if (bounds){
      const newNorthEast = new google.maps.LatLng(bounds.getNorthEast().lat()-0.000018, bounds.getNorthEast().lng()-0.000009);
      const newSouthWest = new google.maps.LatLng(bounds.getSouthWest().lat()+0.000018, bounds.getSouthWest().lng()+0.000009);
      setLastRectangleBounds(new google.maps.LatLngBounds(newSouthWest, newNorthEast));
    }
  }
  const handleElectricityPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setElectricityPrice(parseFloat(event.target.value));
  };
  async function showNewRect(sp: google.maps.Rectangle, rating:number) {
    const ne = sp.getBounds()?.getNorthEast();
    const sw = sp.getBounds()?.getSouthWest();
    if (!ne || !sw || !mapRef.current) return;
  
    const centerLat = (ne.lat() + sw.lat()) / 2;
    const centerLng = (ne.lng() + sw.lng()) / 2;
    const url = `https://api.globalsolaratlas.info/data/lta?loc=${centerLat},${centerLng}`;
  
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const pvout_all = data.monthly.data.PVOUT_csi;
        const pvout_avg = (pvout_all.reduce((accumulator:number, currentValue:number) => accumulator + currentValue, 0) / pvout_all.length)*12;
        const panelCapacity = rating; // Watts
        const panelCount = solarPanel.current.length;
        const installationSize = (panelCount * panelCapacity) / 1000; // kWp
        const installationCost = panelCount * 1700000; // Assuming 1.7M IDR per panel
        const optimumTilt = data.annual.data.OPTA;
        const yearlySolarProduction = pvout_avg * installationSize; // kWh/year
        const pvout_multiplied = pvout_all.map((value: number) => value * installationSize);
  
        // Calculations
        const kgCO2 = yearlySolarProduction * co2PerKWh; // kg CO2 saved
        const treesNeeded = kgCO2 / kgCO2PerTree; // Equivalent number of trees
        const savings = yearlySolarProduction * electricityPrice; // Savings in Rp/year
        var averageAnnualConsumption = energyConsumption.monthly.reduce((acc:number, curr:number) => acc + curr, 0);
        var energyCoverage = yearlySolarProduction / energyConsumption.annual; // Green energy coverage

        if (energyType != "Annual"){
          var energyCoverage = yearlySolarProduction / averageAnnualConsumption;
        }
        let neededEnergy = 0;
        let batteryStorageAh = 0;
        if (energyCoverage < 1) {
          neededEnergy = energyConsumption.annual - yearlySolarProduction;
          if (energyType != "Annual"){
            neededEnergy = averageAnnualConsumption - yearlySolarProduction;
          }
        } else {
          var tambahan = yearlySolarProduction - averageAnnualConsumption;
          // Recommendation for battery storage (simplified assumption)
          batteryStorageAh = (tambahan * 1000) / (48 * 365); // Assume 48V system
          if (energyType != "Annual"){
            batteryStorageAh = (tambahan * 1000) / (48 * 365); // Assume 48V system
          }
        }
        // Set the result data
        setResultData({
          installationSize: Number(installationSize.toFixed(2)),
          averagePotential: Number((pvout_avg).toFixed(2)),
          installationCost,
          treesNeeded: Number(treesNeeded.toFixed(2)),
          potential:pvout_multiplied,
          optimumTilt,
          greenEnergy: Number(yearlySolarProduction.toFixed(2)),
          co2Saved: Number(kgCO2.toFixed(2)),
          solarProduction: Number(yearlySolarProduction.toFixed(2)),
          savings: Number(savings.toFixed(2)),
          energyCoverage: Number((energyCoverage * 100).toFixed(2)),
          batteryStorageAh: Number(batteryStorageAh.toFixed(2)) || 0,  // Default to 0 if undefined
          neededEnergy: Number(neededEnergy.toFixed(2)) || 0,          // Default to 0 if undefined
        });
        chartData1 = generateData("Electricity Usage (kWh)", monthlyPercentages, energyConsumption.annual);
        if (energyType != "Annual"){
          chartData1 = {
            labels:  chartData1.labels,
            datasets: [
              {
                label: "Electricity Usage (kWh)",
                data: energyConsumption.monthly,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          };
        }
        chartData2 = {
          labels: chartData1.labels,
          datasets: [
            {
              label: "Solar Production (kWh)",
              data: resultData?.potential,
              backgroundColor: "rgba(235, 157, 23, 0.2)",
              borderColor: "rgba(180, 114, 0, 1)",
            },
          ],
        };
        excessUnderData = chartData2.datasets[0].data.map((value, index) => value - chartData1.datasets[0].data[index]);
        chartData3 = {
          ...chartData1,
          datasets: [
            chartData1.datasets[0],
            {
              label: "Solar Production (kWh)",
              data: chartData2.datasets[0].data,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
            },
          ],
        };
        chartData4 = {
          labels: chartData1.labels,
          datasets: [
            {
              label: "Excess/Under Energy (kWh)",
              data: excessUnderData,
              backgroundColor: excessUnderData.map((val) => (val > 0 ? "blue" : "red")),
            },
          ],
        };
        console.log(chartData2);
      })
      .catch((error) => {
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
  // Chart data definitions
  
  var chartData1 = generateData("Electricity Usage (kWh)", monthlyPercentages, energyConsumption.annual);
  if (energyType != "Annual"){
    chartData1 = {
      labels:  chartData1.labels,
      datasets: [
        {
          label: "Excess/Under Energy (kWh)",
          data: energyConsumption.monthly,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  }
  var chartData2 = {
    labels: chartData1.labels,
    datasets: [
      {
        label: "Excess/Under Energy (kWh)",
        data: resultData?.potential,
        backgroundColor: "rgba(235, 157, 23, 0.2)",
        borderColor: "rgba(180, 114, 0, 1)",
      },
    ],
  };
  var excessUnderData = chartData2.datasets[0].data.map((value, index) => value - chartData1.datasets[0].data[index]);
  var chartData3 = {
    ...chartData1,
    datasets: [
      chartData1.datasets[0],
      {
        label: "Solar Production (kWh)",
        data: chartData2.datasets[0].data,
        backgroundColor: "rgba(235, 157, 23, 0.2)",
        borderColor: "rgba(180, 114, 0, 1)",
      },
    ],
  };
  var chartData4 = {
    labels: chartData1.labels,
    datasets: [
      {
        label: "Excess/Under Energy (kWh)",
        data: excessUnderData,
        backgroundColor: excessUnderData.map((val) => (val > 0 ? "blue" : "red")),
      },
    ],
  };
  
  return (
    <div className="relative w-full">
      <div className="flex justify-center space-x-4 p-2 bg-gray-200">
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
        <div>
      <div className="mt-6 gap-10 flex">
      <Button onClick={() => setOpen(true)}>Select Module</Button>
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
          <DialogTitle>Select Module</DialogTitle>
          <DialogContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Width (m)</TableCell>
                  <TableCell>Height (m)</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moduleData.map((module, index) => (
                  <TableRow key={index}>
                    <TableCell>{module.model}</TableCell>
                    <TableCell>{module.rating}</TableCell>
                    <TableCell>{module.width}</TableCell>
                    <TableCell>{module.height}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleSelect(module)}>Select</Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Row for custom input */}
                <TableRow>
                  <TableCell>
                    <TextField
                      label="Custom Model"
                      name="model"
                      value={customModule.model}
                      onChange={handleCustomInput}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Custom Rating"
                      name="rating"
                      value={customModule.rating}
                      onChange={handleCustomInput}
                      variant="outlined"
                      size="small"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Custom Width"
                      name="width"
                      value={customModule.width}
                      onChange={handleCustomInput}
                      variant="outlined"
                      size="small"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      label="Custom Height"
                      name="height"
                      value={customModule.height}
                      onChange={handleCustomInput}
                      variant="outlined"
                      size="small"
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={handleCustomSelect}>Select</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
        <div>
          <h3>Selected Module:</h3>
          <p><strong>Model:</strong> {selectedModule.model}</p>
          <p><strong>Rating:</strong> {selectedModule.rating} W</p>
          <p><strong>Width:</strong> {selectedModule.width} m</p>
          <p><strong>Height:</strong> {selectedModule.height} m</p>
        </div>
      </div>
      

      
    </div>
      </div>

      <div
        className={`flex items-center justify-center h-full ${
          activePage !== "input" ? "hidden" : ""
        }`}
      >
        <div className={`flex flex-col items-center justify-center h-full ${activePage !== "input" ? "hidden" : ""}`}>
        <h1 className="text-3xl mt-8">Input</h1>

        <div className="input-section mt-8">
          <label>Energy Consumption Type: </label>
          <select value={energyType} onChange={handleEnergyTypeChange}>
            <option value="Annual">Annual</option>
            <option value="Monthly">Monthly</option>
          </select>
          {energyType === "Annual" && (
            <div className="mt-4">
              <label>Annual Energy Consumption (kWh):</label>
              <input
                type="number"
                value={energyConsumption.annual}
                onChange={(e) => handleEnergyInputChange(0, e.target.value)}
                className="border p-2 ml-2"
              />
            </div>
          )}
          {energyType === "Monthly" &&
            energyConsumption.monthly.map((value: string, index: number) => (
              <div className="mt-4" key={index}>
                <label>{`Month ${index + 1}:`}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleEnergyInputChange(index, e.target.value)}
                  className="border p-2 ml-2"
                />
              </div>
            ))}

          <div className="mt-4">
            <label>Electricity Price (Rp/kWh):</label>
            <input
              type="number"
              value={electricityPrice}
              onChange={handleElectricityPriceChange}
              className="border p-2 ml-2"
            />
          </div>
        </div>
      </div>
      </div>

      <div className={`flex justify-center h-full ${activePage !== "result" ? "hidden" : ""}`}>
        <div className="p-4 mt-4 rounded-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-2">Summary</h2>
        <div>
          <p>Installation Size : {resultData?.installationSize} kWp</p>
          <p>Average Potential (annual) : {resultData?.averagePotential} kWh/kWp</p>
          <p>Cost : Rp{resultData?.installationCost}</p>
          <p className="mb-4">Optimum Tilt : {resultData?.optimumTilt} degree</p>
          <div className="flex justify-around">
            {/* Gambar 1 - Pohon */}
            <div className="text-center">
              <img src="/images/logo/tree.png" alt="Tree" className="h-20 w-20 mx-auto" />
              <p className="mt-2"><b>Equal {resultData?.treesNeeded}</b> <br></br>Tree Carbon Absorption</p>
            </div>

            {/* Gambar 2 - Energi Hijau */}
            <div className="text-center">
              <img src="/images/logo/green_energy.png" alt="Green Energy" className="h-20 w-20 mx-auto" />
              <p className="mt-2"><b>{resultData?.greenEnergy} kWh</b> <br></br>Green Energy</p>
            </div>

            {/* Gambar 3 - CO2 */}
            <div className="text-center">
              <img src="/images/logo/co2.png" alt="CO2" className="h-20 w-20 mx-auto" />
              <p className="mt-2"><b>{resultData?.co2Saved} Kg</b> <br></br>CO2 Avoided</p>
            </div>
          </div>
        </div>

        {/* Bagian Energi */}
        <h2 className="text-2xl font-bold mb-2 mt-6">Energy</h2>
        <div className="flex justify-between">
          <div>
            <p>Solar Production Annually : {resultData?.solarProduction} kWh</p>
            <p>Saving Annually : Rp{resultData?.savings}</p>
            <GaugeChart value={resultData?.energyCoverage} maxValue={1}/>
            <p>Green Energy Coverage : {resultData?.energyCoverage}%</p>
          </div>
        </div>


          {/* Additional / Lacking Power */}
          <h2 className="text-2xl font-bold mb-2 mt-8">Additional / Lacking Power</h2>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <img src="/images/logo/battery.png" alt="Battery" className="h-16 w-16 mr-4" />
              <p>
                {resultData?.batteryStorageAh > 0
                  ? `Recomended Battery Storage : ${resultData?.batteryStorageAh} Ah`
                  : "No battery storage needed"}
              </p>
            </div>
            <div className="flex items-center">
              <img src="/images/logo/energy.png" alt="Energy" className="h-16 w-16 mr-4" />
              <p>
                {resultData?.neededEnergy > 0
                  ? `You will still need to buy ${resultData?.neededEnergy} kWh energy annually`
                  : "No additional energy required"}
              </p>
            </div>
          </div>

          
        </div>

        <div className="p-6 w-full max-w-2xl mt-8 flex flex-col space-y-4 overflow-y-auto max-h-[40rem]">
          {renderChart("Electricity Usage", chartData1)}
          {renderChart("Solar Production", chartData2)}
          {renderChart("Electricity Combination", chartData3)}
          {renderChart("Excess/Under Energy", chartData4)}
        </div>


      </div>


    </div>
  );
};

export default SolarPlanning;
