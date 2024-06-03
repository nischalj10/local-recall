import { Schema, Field, Float32, FixedSizeList, Int32, Utf8, Timestamp, TimeUnit } from "apache-arrow";

export const vector_store_schema = new Schema([
  new Field("id", new Int32()),
  new Field("ss_path", new Utf8()),
  new Field("ss_desc", new Utf8()),
  new Field("ss_desc_emb", new FixedSizeList(128, new Field('emb', new Float32()))),
  new Field("timestamp", new Timestamp(TimeUnit.MILLISECOND))
]);