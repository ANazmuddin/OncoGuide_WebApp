import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://OncoGuide_owner:npg_V1vzPEulry5m@ep-black-union-a1jo8hzh-pooler.ap-southeast-1.aws.neon.tech/OncoGuide?sslmode=require"
);
export const db = drizzle(sql, { schema });
