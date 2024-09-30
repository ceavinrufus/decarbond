"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  value: number;
  maxValue: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, maxValue }) => {
  const percentage = (value / maxValue) * 100;

  const data = {
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#4caf50", "#e0e0e0"],
        borderWidth: 0,
        cutout: "70%", // Creates the hollow space in the middle
        rotation: -140, // Adjust the start angle to make it vertically symmetrical
        circumference: 280, // 80% of the circle (ensures the gauge is 80% arc)
      },
    ],
  };

  const options = {
    rotation: -140, // Start from -140 degrees (ensuring symmetry)
    circumference: 280, // Span 280 degrees for the 80% arc
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    cutout: "70%", // Hollow center
  };

  return (
    <div className="relative size-[200px]">
      <Doughnut data={data} options={options} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-gray-800">
        {value}
      </div>
    </div>
  );
};

export default GaugeChart;
