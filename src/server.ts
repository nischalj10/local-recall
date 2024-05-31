import express from 'express';
import { setupPeriodicScreenshot } from './services/screenshot';

// setup express
const server = express();
let expressServer:any = null;
const PORT = 8337;

server.get('/', (req, res) => {
  res.send('Electron Express server is running!');
});

// start express server and run screenshot service
export function startServer() {
  
  expressServer = server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
  setupPeriodicScreenshot();
}

// function to stop the server
export function stopServer() {
  if (expressServer) {
    expressServer.close(() => {
      console.log('Express server stopped.');
    });
  }
}