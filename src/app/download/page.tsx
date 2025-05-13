'use client';

import { useState } from 'react';
import { IdCardProps } from '../../types/id-card';

const universities = [
  { id: 2, name: 'Addis Ababa University' },
  { id: 2, name: 'Addis Ababa Science and Technology University' },
  // Add more universities as needed
];

export default function Home() {
  const [selectedUniversity, setSelectedUniversity] = useState('');

  const handleDownload = async () => {
    if (!selectedUniversity) return;

    try {
      const response = await fetch(`/api/download?university=${selectedUniversity}`);
      const data: IdCardProps[] = await response.json();

      // Open new window with ID cards
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ID Cards</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body>
            <div id="root"></div>
            <script>
              // This variable holds the fetched data for the new window
              window.cardData = ${JSON.stringify(data)};
            </script>
          </body>
          </html>
        `);

        newWindow.document.close();

        // Use React to render IdCards in the new window
        const root = newWindow.document.getElementById('root');
        if (root) {
          import('react-dom/client').then(({ createRoot }) => {
            const IdCards = require('@/components/a4Page').default;
            const rootInstance = createRoot(root);
            rootInstance.render(<IdCards cards={data} />);
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">ID Card Generator</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select University
            </label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a university</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={!selectedUniversity}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate ID Cards
          </button>
        </div>
      </div>
    </div>
  );
}
