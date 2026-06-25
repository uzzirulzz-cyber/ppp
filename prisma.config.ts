import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "postgresql://neondb_owner:npg_yFe4Y1CQlGZR@ep-rough-glitter-adyw79k2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});