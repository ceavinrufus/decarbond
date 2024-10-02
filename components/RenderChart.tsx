import { Bar } from "react-chartjs-2";

// Chart Display Function
export const RenderChart = (chartType: string, chartData: any) => {
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