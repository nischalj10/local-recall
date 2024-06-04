import { Schema, Field, Float32, FixedSizeList, Int32, Utf8, Timestamp, TimeUnit } from "apache-arrow";
import * as lancedb from "vectordb";
const uri = "~/app-data/local-recall/db";

export const vector_store_schema = new Schema([
  new Field("id", new Int32()),
  new Field("ss_path", new Utf8()),
  new Field("ss_desc", new Utf8()),
  new Field("ss_desc_emb", new FixedSizeList(1024, new Field('emb', new Float32()))),
  new Field("timestamp", new Timestamp(TimeUnit.MILLISECOND))
]);

export async function addToDB(ss_path:any, ss_desc:any, ss_desc_emb:any) {

  if (ss_desc_emb.embedding.length !== 1024) {
    throw new Error(`Embedding length must be 1024, but got ${ss_desc_emb.embedding.length}`);
  }

  const db = await lancedb.connect(uri);
  const table = await db.openTable("main");

  const newData = [{
    id: Date.now(),
    ss_path: ss_path,
    ss_desc: ss_desc,
    ss_desc_emb: ss_desc_emb.embedding,
    timestamp: new Date()
  }];
  
  // Append the row to the table
  await table.add(newData);
}