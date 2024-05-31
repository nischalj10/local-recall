import * as lancedb from "vectordb";
import { Schema, Field, Float32, FixedSizeList, Int32, Float16 } from "apache-arrow";

const uri = "data/sample-lancedb";

const db = await lancedb.connect(uri);

const tbl = await db.createTable(
    "main",
    [
      { vector: [3.1, 4.1], item: "foo", price: 10.0 },
      { vector: [5.9, 26.5], item: "bar", price: 20.0 },
    ],
    { writeMode: lancedb.WriteMode.Overwrite }
);

console.log(await db.tableNames());