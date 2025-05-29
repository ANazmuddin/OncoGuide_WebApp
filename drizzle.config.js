export default {
  dialect: "postgresql",
  schema: "./src/utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://OncoGuide_owner:npg_V1vzPEulry5m@ep-black-union-a1jo8hzh-pooler.ap-southeast-1.aws.neon.tech/OncoGuide?sslmode=require",
    connectionString:
      "postgresql://OncoGuide_owner:npg_V1vzPEulry5m@ep-black-union-a1jo8hzh-pooler.ap-southeast-1.aws.neon.tech/OncoGuide?sslmode=require",
  },
};
