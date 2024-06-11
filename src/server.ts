import express from 'express';
import { setupPeriodicScreenshot, processScreenshotQueue } from './services/screenshot';
import * as lancedb from "vectordb";
import { vector_store_schema } from './services/vectordb';
import {processQuery} from './services/retrieve'
import fs from 'fs' 
import cors from 'cors';

// setup express
const server = express();
server.use(cors());
let expressServer:any = null;
const PORT = 8337;
const uri = "~/app-data/local-recall/db";

server.get('/', (req, res) => {
  res.send('Electron Express server is running!');
});

// TODO: use local system path
server.use('/images', express.static('/Users/nischalj10/app-data/local-recall/screenshots'));

server.get('/search', async (req, res) => {
  const query = req.query.q 
  console.log("api called", query)
  if (typeof query == 'string' && query.trim() !== ''){
    try {
      console.log('Postman query', query)
      const {imagePath, imageDesc, timestamp} = await processQuery(query) 
      if (fs.existsSync(imagePath)) {
        res.json({
          imagePath: imagePath, 
          imageDesc: imageDesc,
          timestamp: timestamp 
        })
      } else {
        res.status(404).send('No relavant content found')
      } 
    } catch (error) {
      console.error(error)
      res.status(500).send('An error occured while processing the query')
    }

  } else {
    res.status(400).send('Invalid query')
  }
})

// start express server, the db and run screenshot service
export async function startServer() {

  const db = await lancedb.connect(uri);

  const tableNames = await db.tableNames();
  if (!tableNames.includes("main")) {
    await db.createTable({ name: "main", schema: vector_store_schema });
  }
  
  console.log(await db.tableNames());
  
  expressServer = server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });

  setupPeriodicScreenshot();
  processScreenshotQueue();

  // Peding issues 
  // 1. phi3 needs to run in local 
  // 2. rag on phi3 should be good. This can be tested parallely with hosted model by putting or using some other account. 
}

// function to stop the server
export function stopServer() {
  if (expressServer) {
    expressServer.close(() => {
      console.log('Express server stopped.');
    });
  }
}