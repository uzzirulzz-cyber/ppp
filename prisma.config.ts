import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_fqRKdIXv03rE@ep-super-recipe-ahhwzv98-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});