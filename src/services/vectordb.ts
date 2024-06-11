import { Schema, Field, Float32, FixedSizeList, Int32, Utf8, Timestamp, TimeUnit } from "apache-arrow";
import * as lancedb from "vectordb";
const uri = "~/app-data/local-recall/db";

export interface DBResult {
  ss_path: string 
  ss_desc: string
  timestamp: string
}

let db: any
let table: any

async function connectDB() {
  if (!db) {
    db = await lancedb.connect(uri)
  }
  return db 
}

async function getTable() {
  if (!table) {
    const db = await connectDB()
    table = await db.openTable("main")
  }
  return table

}

export const vector_store_schema = new Schema([
  new Field("id", new Int32()),
  new Field("ss_path", new Utf8()),
  new Field("ss_desc", new Utf8()),
  new Field("vector", new FixedSizeList(1536, new Field('emb', new Float32())))
  new Field("timestamp", new Timestamp(TimeUnit.MILLISECOND))
]);

export async function addToDB(ss_path: string, ss_desc:string, ss_desc_emb:any) {
  try {
    if (ss_desc_emb.embedding.length !== 1536) {
      throw new Error(`Embedding length must be 1536, but got ${ss_desc_emb.embedding.length}`)
    }

    const table = await getTable()

    const newData = [{
      id: Date.now(),
      ss_path: ss_path,
      ss_desc: ss_desc,
      vector: ss_desc_emb.embedding,
      timestamp: new Date()
    }];
    
    // Append the row to the table
    await table.add(newData)
  } catch (error) {
    console.error(`Error in addToDB: ${error}`)
    throw error;
  }
}

export async function searchDB(emb: any): Promise<DBResult[]> {
  try {
    const table = await getTable()
    const results = await table.search(emb.embedding).limit(1).execute()
    console.log(results)
    const mappedResults: DBResult[] = results.map((result:any) => ({
      ss_path: result.ss_path as string,
      ss_desc: result.ss_desc as string,
      timestamp: result.timestamp as string

    }))
    return mappedResults
  } catch (error) {
    console.error(`Error in searchDB: ${error}`);
    throw error;
  }
}