import express from "express";
import path from "path";
import router from "./routes.js";
import { resetDbClient } from "./db.js";

const app = express();

// Middleware config
app.use(express.json({ limit: "5mb" }));

// Standard lightweight custom CORS middleware to prevent package dependency bloat
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Mount /api endpoints
app.use("/api", router);

// Serve static assets in production (for container runtime compatibility like Cloud Run)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  
  // SPA Fallback: route any non-api paths to frontend index.html
  app.get("*", (req, res, next) => {
    // If it starts with /api, pass to error handler or 404, do not serve index.html
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Start production server on port 3000 only if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(3000, () => {
      console.log("CARDNET container running on port 3000");
    });
  }
}

// Local development listening configuration
if (process.env.NODE_ENV !== "production") {
  // Check if run directly
  const isDirectRun = typeof process !== "undefined" && 
                      process.argv.length > 1 && 
                      (process.argv[1].includes("server") || process.argv[1].includes("index"));
                      
  if (isDirectRun) {
    app.listen(3001, () => {
      console.log("Local development server running on port 3001");
    });
  }
}

// Global Express Error Handler to prevent plain HTML fallbacks
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handling intercepted error:", err);
  
  if (err.name?.includes("Mongo") || err.message?.includes("closed") || err.message?.includes("SSL")) {
    try {
      resetDbClient();
    } catch (e) {}
  }

  res.status(500).json({
    error: "Internal Server Error",
    details: err.message || String(err),
  });
});

export default app;
