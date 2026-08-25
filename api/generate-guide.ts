import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateDestinationGuide } from "../src/server/guide-service";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { city } = body;

    if (!city || typeof city !== "string" || !city.trim()) {
      return res.status(400).json({ error: "City name parameter is required." });
    }

    const result = await generateDestinationGuide(city);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel Serverless Function error in /api/generate-guide:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error occurred while generating guide.",
    });
  }
}
