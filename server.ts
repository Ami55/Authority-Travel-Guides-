import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateDestinationGuide } from "./src/server/guide-service";

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health check
app.get("/api/health", (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: "ok",
    service: "Travel Blueprint API",
    timestamp: new Date().toISOString(),
    geminiConfigured: hasGeminiKey,
  });
});

// API: Generate Destination Travel Guide
app.post("/api/generate-guide", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city || typeof city !== "string" || !city.trim()) {
      return res.status(400).json({ error: "City name parameter is required." });
    }

    const result = await generateDestinationGuide(city);
    return res.json(result);
  } catch (error: any) {
    console.error("Server API generate-guide error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate destination guide",
    });
  }
});

// Vite middleware for local development & static dist serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ameneh Travel Desk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
