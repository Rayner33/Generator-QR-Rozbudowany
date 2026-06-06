import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import QRModal from '../components/QRModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
  const lineData = {
    labels: ['1 Maj', '5 Maj', '10 Maj', '15 Maj', '20 Maj', '25 Maj', '30 Maj'],
    datasets: [
      {
        label: 'Skanowania',
        data: [120, 190, 300, 500, 200, 300, 800],
        borderColor: '#1ea2e4',
        backgroundColor: 'rgba(30, 162, 228, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { 
      y: { grid: { color: '#333' } },
      x: { grid: { display: false } }
    }
  };

  const doughnutData = {
    labels: ['iOS', 'Android', 'Windows', 'Mac'],
    datasets: [{
      data: [45, 35, 15, 5],
      backgroundColor: ['#1ea2e4', '#e41e58', '#e4b01e', '#1ee476'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Analityka</h1>
        <select className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
          <option>Ostatnie 30 dni</option>
          <option>Ostatnie 7 dni</option>
          <option>Cały czas</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Całkowite skanowania</p>
          <h2 className="text-3xl font-bold">2,410</h2>
          <span className="text-green-500 text-sm">+12% vs zeszły miesiąc</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Unikalni użytkownicy</p>
          <h2 className="text-3xl font-bold">1,890</h2>
          <span className="text-green-500 text-sm">+8% vs zeszły miesiąc</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Najlepszy kod</p>
          <h2 className="text-xl font-bold mt-2 truncate text-primary">Kampania Wiosna 2024</h2>
          <span className="text-gray-400 text-sm">840 skanowań</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-6">Skanowania w czasie</h3>
          <Line data={lineData} options={lineOptions} />
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-6">Systemy operacyjne</h3>
          <div className="w-full h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}
