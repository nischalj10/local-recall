import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { format } from 'date-fns';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [imageData, setImageData] = useState(null);

  const handleInputChange = (event:any) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyPress = async (event:any) => {
    if (event.key === 'Enter' && searchQuery.trim() !== '') {
      try {
        const response = await fetch(`http://localhost:8337/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setImageData(data);
        } else {
          console.error('Failed to fetch:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    // const data = {
    //   "imagePath": "/Users/namanjain/app-data/local-recall/screenshots/1717574034181.png",
    //   "imageDesc": "The image is a digital overlay that displays the current time as 4:22, which could be a typo or an unusual format. It shows a landscape oriented view of a picturesque rural area with various elements such as trees, grass, and farm buildings. The background features rolling hills with scattered trees and a clear sky with some cloud cover. In the foreground, there's a road that seems to cut through the scenery, surrounded by lush greenery and possibly fields or pastures. It's a serene, bucolic setting, perhaps indicative of early morning or late afternoon, considering the softness of light.",
    //   "timestamp": 1717757616982
    // }
    // setImageData(data)
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-8">
      <h1 className="text-4xl font-bold">
        say hello to local recall paaji!
      </h1>

      <div className="pt-2 relative mx-auto text-gray-600">
      <input 
          className="border-2 border-gray-200 bg-white h-12 px-1 pr-1 rounded-lg text-sm focus:outline-none w-96"
          type="search" 
          name="search" 
          placeholder="recall your history.."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
/>
      </div>

      {imageData && (
        <div className="space-y-4 text-center pt-10">
          <img src={`http://localhost:8337/images/${imageData.imagePath.split('/').pop()}`} alt="Search Result" className="max-w-lg rounded-lg shadow-lg mx-auto"/>
          <p className="text-sm text-gray-500">experienced on {format(new Date(imageData.timestamp), 'PPP').toLocaleLowerCase()}</p>
          <p className="text-lg text-gray-700 p-16 mx-auto">{imageData.imageDesc.toLocaleLowerCase()}</p>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);