import express from 'express';
import { setupPeriodicScreenshot, processScreenshotQueue } from './services/screenshot';
import * as lancedb from "vectordb";
import { vector_store_schema } from './services/vectordb';
import {processQuery} from './services/retrieve'
import fs from 'fs' 

// setup express
const server = express();
let expressServer:any = null;
const PORT = 8337;
const uri = "~/app-data/local-recall/db";

server.get('/', (req, res) => {
  res.send('Electron Express server is running!');
});

// Api to receive user query. 
// Step 1 - Take the query via api 
// Step 2 - Generate emb of that query 
// Step 3 - Need to pass that to lance db to get he top k embedding 
// Step 3 - For now we will take a look at the top 1 embedding 
// Step 4 - API should return corresponding screenshot which we got from lance db 
server.get('/search', async (req, res) => {
  const query = req.query.q 
  if (typeof query == 'string') {
    const {imagePath, timestamp} = await processQuery(query) 
    if (fs.existsSync(imagePath)) {
      res.json({
        imagePath: imagePath, 
        timestamp: timestamp 
      })
    } else {
      res.status(404).send('No relavant content found')
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
}

// function to stop the server
export function stopServer() {
  if (expressServer) {
    expressServer.close(() => {
      console.log('Express server stopped.');
    });
  }
}