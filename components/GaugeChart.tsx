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

  // Tentukan warna berdasarkan persentase
  const getColors = () => {
    if (percentage <= 50) {
      return ["#4caf50", "#e0e0e0"]; // Hijau jika <= 50%
    } else {
      return ["#4caf50", "#87ceeb", "#e0e0e0"]; // Hijau sampai 50%, Merah setelahnya
    }
  };

  // Tentukan data berdasarkan persentase
  const getData = () => {
    if (percentage <= 50) {
      return [percentage, 100 - percentage]; // Satu segment hijau
    } else {
      return [50, percentage - 50, 100 - percentage]; // Hijau 50%, Merah sisa, abu-abu sisanya
    }
  };

  const data = {
    datasets: [
      {
        data: getData(),
        backgroundColor: getColors(),
        borderWidth: 0,
        cutout: "70%", // Membuat area kosong di tengah
        rotation: -140, // Memulai dari -140 derajat untuk simetri vertikal
        circumference: 280, // 80% lingkaran (untuk gauge 80% arc)
      },
    ],
  };

  const options = {
    rotation: -140, // Mulai dari -140 derajat untuk simetri
    circumference: 280, // Membentang 280 derajat untuk arc 80%
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
