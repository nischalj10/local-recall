import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="h-screen flex justify-center items-center">
      <h1 className="text-4xl font-bold underline">
        Hello, Electron Forge with React and Tailwind CSS!
      </h1>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);