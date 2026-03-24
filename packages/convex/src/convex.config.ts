import { defineApp } from "convex/server";

import files from "@acme/files/convex.config";

const app = defineApp();
app.use(files);

export default app;
